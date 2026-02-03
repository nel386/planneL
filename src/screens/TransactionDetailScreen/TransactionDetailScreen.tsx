import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dialog, useToast } from '../../components';
import { deleteReceiptItem, getReceiptItemsByTransaction, insertReceiptItem, updateReceiptItem, ReceiptItem, useAppData } from '../../data';
import { colors } from '../../theme';
import { formatCurrency, formatCurrencyInput, toIsoDate } from '../../utils';
import {
  ReceiptCategoryPickerState,
  TransactionDetailDialogState,
  TransactionDetailRouteParams,
} from './TransactionDetailScreen.types';
import { buildReceiptItem, parseDecimalInput } from './TransactionDetailScreen.tools';
import { styles } from './TransactionDetailScreen.styles';

export const TransactionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId } = route.params as TransactionDetailRouteParams;
  const { categories, transactions, editTransaction, removeTransaction } = useAppData();
  const { show } = useToast();

  const transaction = useMemo(
    () => transactions.find((item) => item.id === transactionId) ?? null,
    [transactions, transactionId]
  );
  const category = categories.find((cat) => cat.id === transaction?.categoryId);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [dialog, setDialog] = useState<TransactionDetailDialogState | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [categoryPicker, setCategoryPicker] = useState<ReceiptCategoryPickerState | null>(null);

  useEffect(() => {
    if (!transaction) return;
    setAmount(String(transaction.amount));
    setTitle(transaction.title);
    setNote(transaction.note ?? '');
    setCategoryId(transaction.categoryId);
    setDate(new Date(transaction.date));
  }, [transaction]);

  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      try {
        const result = await getReceiptItemsByTransaction(transactionId);
        setItems(result);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };
    loadItems();
  }, [transactionId]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.missing}>
          <Text style={styles.title}>Movimiento no encontrado</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!categoryId) return;
    const parsed = parseDecimalInput(amount);
    if (!title.trim()) {
      setDialog({ title: 'Falta el concepto', message: 'Escribe un nombre para el gasto.' });
      return;
    }
    if (!parsed || parsed <= 0) {
      setDialog({ title: 'Importe invalido', message: 'Introduce un importe valido.' });
      return;
    }

    await editTransaction({
      ...transaction,
      title: title.trim(),
      amount: parsed,
      categoryId,
      note: note.trim() || undefined,
      date: toIsoDate(date),
    });
    show('Gasto actualizado', 'success');
  };

  const handleDelete = () => {
    setDialog({
      title: 'Eliminar gasto',
      message: 'Esta accion no se puede deshacer.',
      onConfirm: async () => {
        await removeTransaction(transaction.id);
        setDialog(null);
        navigation.goBack();
        show('Gasto eliminado', 'info');
      },
    });
  };

  const openNewItem = () => {
    setEditingItemId(null);
    setItemName('');
    setItemPrice('');
    setItemModalOpen(true);
  };

  const openEditItem = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemPrice(item.price != null ? String(item.price) : '');
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      setDialog({ title: 'Falta el nombre', message: 'Escribe el nombre del producto.' });
      return;
    }
    const priceValue = itemPrice ? parseDecimalInput(itemPrice) : undefined;
    if (itemPrice && (priceValue == null || priceValue < 0)) {
      setDialog({ title: 'Precio invalido', message: 'Introduce un importe valido.' });
      return;
    }

    if (editingItemId) {
      const updated: ReceiptItem = buildReceiptItem({
        id: editingItemId,
        transactionId,
        name: itemName,
        price: priceValue,
        categoryId: items.find((entry) => entry.id === editingItemId)?.categoryId,
      });
      await updateReceiptItem(updated);
      setItems((prev) => prev.map((item) => (item.id === editingItemId ? updated : item)));
      show('Linea actualizada', 'success');
    } else {
      const newItem: ReceiptItem = buildReceiptItem({
        transactionId,
        name: itemName,
        price: priceValue,
      });
      await insertReceiptItem(newItem);
      setItems((prev) => [...prev, newItem]);
      show('Linea anadida', 'success');
    }

    setItemModalOpen(false);
  };

  const handleDeleteItem = async (item: ReceiptItem) => {
    setDialog({
      title: 'Eliminar linea',
      message: 'Se borrara del ticket.',
      onConfirm: async () => {
        await deleteReceiptItem(item.id);
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
        setDialog(null);
        show('Linea eliminada', 'info');
      },
    });
  };

  const expenseCategories =
    transaction.type === 'income'
      ? categories.filter((cat) => cat.id === 'salary')
      : categories.filter((cat) => cat.id !== 'salary');

  const categoryTotals = items.reduce<Record<string, number>>((acc, item) => {
    if (!item.categoryId || item.price == null) return acc;
    acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.price;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Detalle</Text>
          <View style={styles.iconButton} />
        </View>

        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.subtitle}>
          {category?.label ?? 'Sin categoria'} - {formatCurrency(transaction.amount)}
        </Text>

        {transaction.receiptUri ? (
          <View style={styles.receiptWrap}>
            <Image source={{ uri: transaction.receiptUri }} style={styles.receiptImage} />
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Editar gasto</Text>
          <Text style={styles.label}>Importe</Text>
          <TextInput
            placeholder="0,00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(value) => setAmount(formatCurrencyInput(value))}
            style={styles.input}
          />

          <Text style={styles.label}>Concepto</Text>
          <TextInput
            placeholder="Ej: Supermercado"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {expenseCategories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.categoryChipText}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Fecha</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDate(true)}>
            <Text style={styles.dateText}>{toIsoDate(date)}</Text>
          </Pressable>
          {showDate ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, selected) => {
                setShowDate(false);
                if (selected) setDate(selected);
              }}
            />
          ) : null}

          <Text style={styles.label}>Nota</Text>
          <TextInput
            placeholder="Opcional"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.actionsRow}>
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Lineas OCR</Text>
            <Pressable style={styles.addItemButton} onPress={openNewItem}>
              <Ionicons name="add" size={18} color={colors.ink} />
              <Text style={styles.addItemText}>Anadir</Text>
            </Pressable>
          </View>

          {Object.keys(categoryTotals).length ? (
            <View style={styles.splitSummary}>
              <Text style={styles.splitTitle}>Split por categoria</Text>
              {Object.entries(categoryTotals).map(([catId, total]) => (
                <View key={catId} style={styles.splitRow}>
                  <Text style={styles.splitLabel}>
                    {categories.find((cat) => cat.id === catId)?.label ?? 'Sin categoria'}
                  </Text>
                  <Text style={styles.splitValue}>{formatCurrency(total)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {loadingItems ? (
            <Text style={styles.mutedText}>Cargando lineas...</Text>
          ) : items.length ? (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <Pressable key={item.id} style={styles.itemRow} onPress={() => openEditItem(item)}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Pressable
                      style={styles.itemCategory}
                      onPress={(event) => {
                        event.stopPropagation();
                        setCategoryPicker({
                          itemId: item.id,
                          currentCategoryId: item.categoryId,
                        });
                      }}
                    >
                      <Text style={styles.itemCategoryText}>
                        {item.categoryId
                          ? categories.find((cat) => cat.id === item.categoryId)?.label ?? 'Sin categoria'
                          : 'Asignar categoria'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.itemRight}>
                    {item.price != null ? <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text> : null}
                    <Pressable
                      style={styles.itemDelete}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleDeleteItem(item);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>Sin lineas guardadas.</Text>
          )}
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={itemModalOpen} onRequestClose={() => setItemModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingItemId ? 'Editar linea' : 'Nueva linea'}</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Ej: Pan"
              placeholderTextColor={colors.muted}
              value={itemName}
              onChangeText={setItemName}
              style={styles.input}
            />
            <Text style={styles.label}>Precio</Text>
            <TextInput
              placeholder="Opcional"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={itemPrice}
              onChangeText={(value) => setItemPrice(formatCurrencyInput(value))}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setItemModalOpen(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveItem}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Dialog
        visible={!!dialog}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        confirmLabel={dialog?.onConfirm ? 'Eliminar' : 'Cerrar'}
        cancelLabel="Cancelar"
        onCancel={dialog?.onConfirm ? () => setDialog(null) : undefined}
        onConfirm={() => {
          if (dialog?.onConfirm) {
            dialog.onConfirm();
          } else {
            setDialog(null);
          }
        }}
        destructive={!!dialog?.onConfirm}
      />

      {categoryPicker ? (
        <Modal transparent animationType="fade" visible={!!categoryPicker} onRequestClose={() => setCategoryPicker(null)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setCategoryPicker(null)}>
            <Pressable style={styles.sheetCard} onPress={() => null}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Asignar categoria</Text>
              <ScrollView style={styles.sheetList}>
                {expenseCategories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.sheetOption,
                      categoryPicker.currentCategoryId === cat.id && styles.sheetOptionActive,
                    ]}
                    onPress={async () => {
                      const target = items.find((entry) => entry.id === categoryPicker.itemId);
                      if (!target) return;
                      const updated: ReceiptItem = { ...target, categoryId: cat.id };
                      await updateReceiptItem(updated);
                      setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
                      setCategoryPicker(null);
                      show('Categoria asignada', 'success');
                    }}
                  >
                    <Text style={styles.sheetOptionText}>{cat.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

