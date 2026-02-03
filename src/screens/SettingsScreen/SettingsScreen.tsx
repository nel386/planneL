import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, useToast } from '../../components';
import { useAppData } from '../../data';
import { colors } from '../../theme';
import { filterCategories, getDefaultCategoryForm, iconOptions, colorOptions } from './SettingsScreen.tools';
import { CategoryFormState, SettingsDialogState } from './SettingsScreen.types';
import { styles } from './SettingsScreen.styles';

export const SettingsScreen = () => {
  const { categories, rules, addCategory, editCategory, removeCategory, addRule, removeRule } = useAppData();
  const { show } = useToast();
  const [dialog, setDialog] = useState<SettingsDialogState | null>(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [ruleModal, setRuleModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(getDefaultCategoryForm());
  const [rulePattern, setRulePattern] = useState('');
  const [ruleCategoryId, setRuleCategoryId] = useState<string | null>(null);
  const [ruleSheetOpen, setRuleSheetOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState('');

  const filteredCategories = useMemo(
    () => filterCategories(categories, categoryQuery),
    [categories, categoryQuery]
  );

  const openCategoryEditor = (id?: string) => {
    if (id) {
      const existing = categories.find((cat) => cat.id === id);
      if (existing) {
        setEditingCategoryId(existing.id);
        setCategoryForm({ label: existing.label, icon: existing.icon, color: existing.color });
      }
    } else {
      setEditingCategoryId(null);
      setCategoryForm(getDefaultCategoryForm());
    }
    setCategoryModal(true);
  };

  const openRuleEditor = () => {
    setRulePattern('');
    setRuleCategoryId(null);
    setCategoryQuery('');
    setRuleModal(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Control total de tus datos</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <Pressable style={styles.sectionAction} onPress={() => openCategoryEditor()}>
              <Text style={styles.sectionActionText}>Nueva</Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            {categories.map((cat) => (
              <Pressable key={cat.id} style={styles.row} onPress={() => openCategoryEditor(cat.id)}>
                <View>
                  <Text style={styles.rowTitle}>{cat.label}</Text>
                  <Text style={styles.rowHint}>{cat.icon} · {cat.color}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reglas automaticas</Text>
            <Pressable style={styles.sectionAction} onPress={openRuleEditor}>
              <Text style={styles.sectionActionText}>Nueva</Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            {rules.map((rule) => {
              const category = categories.find((cat) => cat.id === rule.categoryId);
              return (
                <Pressable
                  key={rule.id}
                  style={styles.row}
                  onPress={() =>
                    setDialog({
                      title: 'Eliminar regla',
                      message: `"${rule.pattern}" ? ${category?.label ?? 'Sin categoria'}`,
                      onConfirm: async () => {
                        await removeRule(rule.id);
                        setDialog(null);
                        show('Regla eliminada', 'info');
                      },
                    })
                  }
                >
                  <View>
                    <Text style={styles.rowTitle}>{rule.pattern}</Text>
                    <Text style={styles.rowHint}>{category?.label ?? 'Sin categoria'}</Text>
                  </View>
                  <Text style={styles.chevron}>×</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Modal transparent animationType="slide" visible={categoryModal} onRequestClose={() => setCategoryModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingCategoryId ? 'Editar categoria' : 'Nueva categoria'}</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Ej: Mascotas"
              placeholderTextColor={colors.muted}
              value={categoryForm.label}
              onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, label: value }))}
              style={styles.input}
            />

            <Text style={styles.label}>Icono</Text>
            <View style={styles.optionsRow}>
              {iconOptions.map((icon) => (
                <Pressable
                  key={icon}
                  style={[styles.optionChip, categoryForm.icon === icon && styles.optionChipActive]}
                  onPress={() => setCategoryForm((prev) => ({ ...prev, icon }))}
                >
                  <Text style={styles.optionChipText}>{icon}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.optionsRow}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    categoryForm.color === color && styles.colorDotActive,
                  ]}
                  onPress={() => setCategoryForm((prev) => ({ ...prev, color }))}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              {editingCategoryId ? (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => {
                    setDialog({
                      title: 'Eliminar categoria',
                      message: 'Se borrara tambien su historial asociado.',
                      onConfirm: async () => {
                        await removeCategory(editingCategoryId);
                        setDialog(null);
                        setCategoryModal(false);
                        show('Categoria eliminada', 'info');
                      },
                    });
                  }}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.saveButton}
                onPress={async () => {
                  if (!categoryForm.label.trim()) {
                    setDialog({ title: 'Falta nombre', message: 'Pon un nombre para la categoria.' });
                    return;
                  }
                  if (editingCategoryId) {
                    await editCategory({
                      id: editingCategoryId,
                      label: categoryForm.label.trim(),
                      icon: categoryForm.icon,
                      color: categoryForm.color,
                    });
                    show('Categoria actualizada', 'success');
                  } else {
                    await addCategory({
                      label: categoryForm.label.trim(),
                      icon: categoryForm.icon,
                      color: categoryForm.color,
                    });
                    show('Categoria creada', 'success');
                  }
                  setCategoryModal(false);
                }}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={ruleModal} onRequestClose={() => setRuleModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva regla</Text>

            <Text style={styles.label}>Texto que contiene</Text>
            <TextInput
              placeholder="Ej: mercadona"
              placeholderTextColor={colors.muted}
              value={rulePattern}
              onChangeText={setRulePattern}
              style={styles.input}
            />

            <Text style={styles.label}>Categoria</Text>
            <Pressable style={styles.selectorButton} onPress={() => setRuleSheetOpen(true)}>
              <Text style={styles.selectorText}>
                {categories.find((cat) => cat.id === ruleCategoryId)?.label ?? 'Selecciona categoria'}
              </Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setRuleModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={async () => {
                  if (!rulePattern.trim() || !ruleCategoryId) {
                    setDialog({ title: 'Datos incompletos', message: 'Escribe un texto y categoria.' });
                    return;
                  }
                  await addRule({ pattern: rulePattern.trim().toLowerCase(), categoryId: ruleCategoryId });
                  setRuleModal(false);
                  show('Regla creada', 'success');
                }}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {ruleSheetOpen ? (
        <Modal transparent animationType="fade" visible={ruleSheetOpen}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setRuleSheetOpen(false)}>
            <Pressable style={styles.sheetCard} onPress={() => null}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Elige categoria</Text>
              <TextInput
                placeholder="Buscar..."
                placeholderTextColor={colors.muted}
                value={categoryQuery}
                onChangeText={setCategoryQuery}
                style={styles.sheetSearch}
              />
              <ScrollView style={styles.sheetList}>
                {filteredCategories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[styles.sheetOption, ruleCategoryId === cat.id && styles.sheetOptionActive]}
                    onPress={() => {
                      setRuleCategoryId(cat.id);
                      setRuleSheetOpen(false);
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
    </SafeAreaView>
  );
};

