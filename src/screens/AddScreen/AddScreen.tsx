import { useState } from 'react';
import { Image, InteractionManager, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, CategoryPill, Dialog, useToast } from '../../components';
import { useAppData } from '../../data';
import { colors } from '../../theme';
import { formatCurrencyInput, OcrItem, saveImageToApp, toIsoDate, uploadReceipt } from '../../utils';
import { AddScreenDialogState, AmountSource } from './AddScreen.types';
import { dedupeOcrItems, getItemsSum, normalizeOcrItems, parseTotalFromLines } from './AddScreen.tools';
import { styles } from './AddScreen.styles';

export const AddScreen = () => {
  const { categories, rules, addTransaction, loading } = useAppData();
  const { show } = useToast();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrHint, setOcrHint] = useState<string | null>(null);
  const [ocrItems, setOcrItems] = useState<OcrItem[]>([]);
  const [ocrTotal, setOcrTotal] = useState<number | null>(null);
  const [amountSource, setAmountSource] = useState<AmountSource>('manual');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialog, setDialog] = useState<AddScreenDialogState | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const expenseCategories = categories.filter((cat) => cat.id !== 'salary');
  const expenseRules = rules.filter((rule) => expenseCategories.some((cat) => cat.id === rule.categoryId));

  const showDialog = (
    titleText: string,
    message?: string,
    options?: { confirmLabel?: string; cancelLabel?: string; onConfirm?: () => void }
  ) => {
    setDialog({ title: titleText, message, ...options });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (manualCategory) return;
    const lower = value.toLowerCase();
    const matched = expenseRules.find((rule) => lower.includes(rule.pattern.toLowerCase()));
    if (matched) {
      setCategoryId(matched.categoryId);
    }
  };

  const handleCategoryPick = (id: string) => {
    setCategoryId(id);
    setManualCategory(true);
  };

  const handleSave = async () => {
    const parsed = Number(amount.replace(',', '.'));
    if (!title.trim()) {
      showDialog('Falta el concepto', 'Escribe un nombre para el gasto.');
      return;
    }
    if (!categoryId) {
      showDialog('Selecciona una categoria', 'Elige donde encaja este gasto.');
      return;
    }
    if (Number.isNaN(parsed) || parsed <= 0) {
      showDialog('Importe invalido', 'Introduce un importe valido.');
      return;
    }

    await addTransaction({
      title: title.trim(),
      categoryId,
      amount: parsed,
      type: 'expense',
      note: note.trim() || undefined,
      date: toIsoDate(date),
      receiptUri: receiptUri ?? undefined,
      items: ocrItems.length ? ocrItems.map((item) => ({ name: item.name, price: item.price })) : undefined,
    });

    setAmount('');
    setTitle('');
    setNote('');
    setCategoryId(null);
    setManualCategory(false);
    setOcrHint(null);
    setOcrItems([]);
    setOcrTotal(null);
    setAmountSource('manual');
    setDate(new Date());
    setReceiptUri(null);
    show('Gasto guardado', 'success');
  };

  const openNewItem = () => {
    setEditingItemIndex(null);
    setItemName('');
    setItemPrice('');
    setItemModalOpen(true);
  };

  const openEditItem = (index: number) => {
    const item = ocrItems[index];
    if (!item) return;
    setEditingItemIndex(index);
    setItemName(item.name);
    setItemPrice(item.price != null ? String(item.price) : '');
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      showDialog('Falta el nombre', 'Escribe el nombre del producto.');
      return;
    }
    const priceValue = itemPrice ? Number(itemPrice.replace(',', '.')) : undefined;
    if (itemPrice && (Number.isNaN(priceValue) || (priceValue ?? 0) < 0)) {
      showDialog('Precio invalido', 'Introduce un importe valido.');
      return;
    }

    if (editingItemIndex != null) {
      const next = ocrItems.map((item, index) =>
        index === editingItemIndex ? { name: itemName.trim(), price: priceValue ?? 0 } : item
      );
      setOcrItems(next);
      if (amountSource === 'sum') applySumToAmount(next);
    } else {
      const next = [...ocrItems, { name: itemName.trim(), price: priceValue ?? 0 }];
      setOcrItems(next);
      if (amountSource === 'sum') applySumToAmount(next);
    }
    setItemModalOpen(false);
  };

  const handleDeleteItem = (index: number) => {
    const next = ocrItems.filter((_, i) => i !== index);
    setOcrItems(next);
    if (amountSource === 'sum') applySumToAmount(next);
  };

  const applySumToAmount = (items: OcrItem[]) => {
    const sum = getItemsSum(items);
    setAmount(sum ? sum.toFixed(2) : '');
    setAmountSource('sum');
  };

  const applyTotalToAmount = (total: number | null) => {
    if (total == null) return;
    setAmount(total.toFixed(2));
    setAmountSource('total');
  };

  const updateDebug = (label: string, payload: Record<string, unknown>) => {
    const stamp = new Date().toISOString();
    const info = `${stamp} | ${label} | ${JSON.stringify(payload)}`;
    setDebugInfo((prev) => {
      const entries = [info, ...(prev ? prev.split('\n') : [])];
      return entries.slice(0, 8).join('\n');
    });
    console.log(info);
  };

  const handlePickFromLibrary = async (withOcr: boolean) => {
    const imageMediaTypes =
      ImagePicker.MediaType?.Images ??
      (ImagePicker as unknown as { MediaTypeOptions?: { Images?: ImagePicker.MediaType } }).MediaTypeOptions?.Images;
    updateDebug('requestMediaLibraryPermissions', { withOcr });
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    updateDebug('mediaLibraryPermissionsResult', perm as unknown as Record<string, unknown>);
    if (!perm.granted) {
      if (!perm.canAskAgain) {
        showDialog('Permiso bloqueado', 'Activa acceso a fotos desde ajustes.', {
          confirmLabel: 'Abrir ajustes',
          cancelLabel: 'Cancelar',
          onConfirm: () => {
            setDialog(null);
            Linking.openSettings();
          },
        });
        return;
      }
      showDialog('Permiso requerido', 'Necesitamos acceso a tus imagenes.');
      return;
    }

    updateDebug('launchImageLibrary', { withOcr });
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: imageMediaTypes ?? undefined,
      quality: 0.85,
    });
    updateDebug('imageLibraryResult', {
      canceled: result.canceled,
      assets: result.assets?.length ?? 0,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const stored = await saveImageToApp(asset.uri);
    setReceiptUri(stored);
    setOcrHint(null);
    setOcrItems([]);
    setOcrTotal(null);
    if (withOcr) {
      await runOcr(stored);
    }
  };

  const handlePickFromCamera = async (withOcr: boolean) => {
    const imageMediaTypes =
      ImagePicker.MediaType?.Images ??
      (ImagePicker as unknown as { MediaTypeOptions?: { Images?: ImagePicker.MediaType } }).MediaTypeOptions?.Images;
    updateDebug('requestCameraPermissions', { withOcr });
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    updateDebug('cameraPermissionsResult', perm as unknown as Record<string, unknown>);
    if (!perm.granted) {
      if (!perm.canAskAgain) {
        showDialog('Permiso bloqueado', 'Activa acceso a la camara desde ajustes.', {
          confirmLabel: 'Abrir ajustes',
          cancelLabel: 'Cancelar',
          onConfirm: () => {
            setDialog(null);
            Linking.openSettings();
          },
        });
        return;
      }
      showDialog('Permiso requerido', 'Necesitamos acceso a tu camara.');
      return;
    }

    updateDebug('launchCamera', { withOcr });
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: imageMediaTypes ?? undefined,
        quality: 0.85,
      });
    } catch (error) {
      const err = error as { name?: string; message?: string };
      updateDebug('cameraLaunchError', { name: err?.name, message: err?.message });
      showDialog('Camara fallo', 'No se pudo abrir la camara.');
      return;
    }
    updateDebug('cameraResult', {
      canceled: result.canceled,
      assets: result.assets?.length ?? 0,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const stored = await saveImageToApp(result.assets[0].uri);
    setReceiptUri(stored);
    setOcrHint(null);
    setOcrItems([]);
    setOcrTotal(null);
    if (withOcr) {
      await runOcr(stored);
    }
  };

  const openCameraFromSheet = (withOcr: boolean) => {
    setSheetOpen(false);
    InteractionManager.runAfterInteractions(() => {
      handlePickFromCamera(withOcr);
    });
  };

  const openLibraryFromSheet = (withOcr: boolean) => {
    setSheetOpen(false);
    InteractionManager.runAfterInteractions(() => {
      handlePickFromLibrary(withOcr);
    });
  };

  const runOcr = async (uri: string) => {
    try {
      setOcrLoading(true);
      setOcrHint('Procesando ticket...');
      const ocr = await uploadReceipt(uri);
      console.log('[OCR] response', ocr);
      setDebugInfo((prev) => {
        const info = `OCR response | ${JSON.stringify(ocr)}`;
        const entries = [info, ...(prev ? prev.split('\n') : [])];
        return entries.slice(0, 8).join('\n');
      });

      if (ocr.merchant && !title.trim()) {
        handleTitleChange(ocr.merchant);
      }

      if (ocr.items?.length) {
        const cleanedItems = normalizeOcrItems(dedupeOcrItems(ocr.items));
        setOcrItems(cleanedItems);
        const itemsText = cleanedItems
          .slice(0, 8)
          .map((item) => `${item.name} - ${item.price}`)
          .join('\n');
        setNote(itemsText);

        const extractedTotal = ocr.total ?? parseTotalFromLines(ocr.raw_text ?? []);
        setOcrTotal(extractedTotal ?? null);
        if (extractedTotal != null) {
          applyTotalToAmount(extractedTotal);
        } else {
          applySumToAmount(cleanedItems);
        }
      } else {
        setOcrItems([]);
        const extractedTotal = ocr.total ?? parseTotalFromLines(ocr.raw_text ?? []);
        setOcrTotal(extractedTotal ?? null);
        if (extractedTotal != null) {
          applyTotalToAmount(extractedTotal);
        }
      }

      setOcrHint(`Detectado (${ocr.language}) con ${Math.round(ocr.confidence * 100)}%`);
      show('OCR completado', 'info');
    } catch (error) {
      console.error(error);
      setOcrHint(null);
      setOcrItems([]);
      setOcrTotal(null);
      showDialog('OCR fallo', 'No se pudo leer el ticket.');
    } finally {
      setOcrLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nuevo gasto</Text>
        <Text style={styles.subtitle}>Captura rapido y ordena tus compras</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Importe</Text>
          <TextInput
            placeholder="0,00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(value) => {
              setAmount(formatCurrencyInput(value));
              setAmountSource('manual');
            }}
            style={styles.input}
          />

          <Text style={styles.label}>Concepto</Text>
          <TextInput
            placeholder="Ej: Supermercado"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={handleTitleChange}
            style={styles.input}
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pills}>
            {expenseCategories.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                color={cat.color}
                selected={categoryId === cat.id}
                onPress={() => handleCategoryPick(cat.id)}
              />
            ))}
          </View>

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
        </View>

        <Pressable style={styles.cta} onPress={handleSave}>
          <Text style={styles.ctaText}>Guardar gasto</Text>
        </Pressable>

        <View style={styles.photoCard}>
          <Text style={styles.photoTitle}>Sube ticket o captura</Text>
          <Text style={styles.photoHint}>OCR automatico con PaddleOCR.</Text>
          <Pressable style={styles.photoButton} onPress={() => setSheetOpen(true)} disabled={ocrLoading}>
            <Text style={styles.photoButtonText}>{ocrLoading ? 'Procesando...' : 'Elegir imagen'}</Text>
          </Pressable>
          {ocrHint ? <Text style={styles.ocrHint}>{ocrHint}</Text> : null}
          {receiptUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: receiptUri }} style={styles.preview} />
              <Pressable style={styles.removePreview} onPress={() => setReceiptUri(null)}>
                <Text style={styles.removePreviewText}>Quitar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.itemsCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>Previsualizacion OCR</Text>
            <Pressable style={styles.itemsAdd} onPress={openNewItem}>
              <Ionicons name="add" size={18} color={colors.ink} />
              <Text style={styles.itemsAddText}>Agregar</Text>
            </Pressable>
          </View>
          <View style={styles.reconcileCard}>
            <Text style={styles.reconcileTitle}>Reconciliacion inteligente</Text>
            <Text style={styles.reconcileText}>
              {ocrTotal != null ? `Total detectado: ${ocrTotal.toFixed(2)}€` : 'Total detectado: -'}
            </Text>
            <Text style={styles.reconcileText}>
              {`Suma lineas: ${getItemsSum(ocrItems).toFixed(2)}€`}
            </Text>
            {ocrTotal != null && Math.abs(getItemsSum(ocrItems) - ocrTotal) > 0.05 ? (
              <Text style={styles.reconcileWarn}>
                Diferencia de {Math.abs(getItemsSum(ocrItems) - ocrTotal).toFixed(2)}€. Elige la mejor opcion.
              </Text>
            ) : null}
            <View style={styles.reconcileActions}>
              <Pressable
                style={[styles.reconcileButton, ocrTotal == null && styles.reconcileButtonDisabled]}
                onPress={() => applyTotalToAmount(ocrTotal)}
                disabled={ocrTotal == null}
              >
                <Text style={styles.reconcileButtonText}>Usar total</Text>
              </Pressable>
              <Pressable
                style={[styles.reconcileButton, !ocrItems.length && styles.reconcileButtonDisabled]}
                onPress={() => applySumToAmount(ocrItems)}
                disabled={!ocrItems.length}
              >
                <Text style={styles.reconcileButtonText}>Usar suma</Text>
              </Pressable>
            </View>
            {amountSource !== 'manual' ? (
              <Text style={styles.reconcileHint}>
                Importe actualizado por {amountSource === 'total' ? 'total detectado' : 'suma de lineas'}.
              </Text>
            ) : null}
          </View>
          {ocrItems.length ? (
            <View style={styles.itemsList}>
              {ocrItems.map((item, index) => (
                <Pressable key={`${item.name}-${index}`} style={styles.itemRow} onPress={() => openEditItem(index)}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>{item.price != null ? item.price.toFixed(2) : '0.00'}€</Text>
                    <Pressable
                      style={styles.itemDelete}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleDeleteItem(index);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.itemsEmpty}>Sin lineas OCR. Puedes agregar manualmente.</Text>
          )}
        </View>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Diagnostico permisos</Text>
          <Text style={styles.debugText}>
            {debugInfo ?? 'Pulsa Camara o Galeria para ver el log aqui.'}
          </Text>
          <Pressable
            style={styles.debugButton}
            onPress={async () => {
              const lib = await ImagePicker.getMediaLibraryPermissionsAsync();
              const cam = await ImagePicker.getCameraPermissionsAsync();
              updateDebug('currentPermissions', { mediaLibrary: lib, camera: cam });
            }}
          >
            <Text style={styles.debugButtonText}>Revisar permisos ahora</Text>
          </Pressable>
          <Pressable style={styles.debugLink} onPress={() => Linking.openSettings()}>
            <Text style={styles.debugLinkText}>Abrir ajustes del sistema</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomSheet
        visible={sheetOpen}
        title="Selecciona origen"
        onClose={() => setSheetOpen(false)}
        options={[
          { label: 'Camara (OCR)', onPress: () => openCameraFromSheet(true) },
          { label: 'Galeria (OCR)', onPress: () => openLibraryFromSheet(true) },
          { label: 'Camara (solo adjuntar)', onPress: () => openCameraFromSheet(false) },
          { label: 'Galeria (solo adjuntar)', onPress: () => openLibraryFromSheet(false) },
        ]}
      />

      <Dialog
        visible={!!dialog}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        confirmLabel={dialog?.confirmLabel ?? 'Cerrar'}
        cancelLabel={dialog?.cancelLabel ?? 'Cancelar'}
        onCancel={dialog?.confirmLabel ? () => setDialog(null) : undefined}
        onConfirm={dialog?.onConfirm ?? (() => setDialog(null))}
      />

      <Modal transparent animationType="fade" visible={itemModalOpen} onRequestClose={() => setItemModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingItemIndex != null ? 'Editar linea' : 'Nueva linea'}</Text>
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
              <Pressable style={styles.modalCancel} onPress={() => setItemModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSaveItem}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

