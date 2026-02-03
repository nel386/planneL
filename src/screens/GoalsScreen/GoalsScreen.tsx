import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dialog, ProgressBar, SectionHeader, useToast } from '../../components';
import { useAppData } from '../../data';
import { colors } from '../../theme';
import { formatCurrency, formatCurrencyInput, toIsoDate } from '../../utils';
import { GoalsDialogState } from './GoalsScreen.types';
import { parseDecimalInput } from './GoalsScreen.tools';
import { styles } from './GoalsScreen.styles';

export const GoalsScreen = () => {
  const { goals, loading, addGoal } = useAppData();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [due, setDue] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [dialog, setDialog] = useState<GoalsDialogState | null>(null);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando objetivos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Objetivos</Text>
        <Text style={styles.subtitle}>Ahorro con fecha y progreso</Text>

        <View style={styles.section}>
          <SectionHeader title="Tus metas" actionLabel="Nuevo" onAction={() => setOpen(true)} />
          {goals.map((goal) => (
            <View key={goal.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{goal.title}</Text>
                <Text style={styles.cardMeta}>{goal.due}</Text>
              </View>
              <Text style={styles.cardAmount}>
                {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
              </Text>
              <ProgressBar value={goal.saved} max={goal.target} color={colors.accent} />
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Sugerencia</Text>
          <Text style={styles.tipText}>Reserva un fijo semanal y planneL ajusta el resto de tu presupuesto.</Text>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo objetivo</Text>
            <Text style={styles.modalSubtitle}>Define una meta y fecha</Text>

            <Text style={styles.label}>Titulo</Text>
            <TextInput
              placeholder="Ej: Fondo emergencia"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <Text style={styles.label}>Objetivo (€)</Text>
            <TextInput
              placeholder="3000"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={target}
              onChangeText={(value) => setTarget(formatCurrencyInput(value))}
              style={styles.input}
            />

            <Text style={styles.label}>Fecha limite</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowDate(true)}>
              <Text style={styles.dateText}>{toIsoDate(due)}</Text>
            </Pressable>

            {showDate ? (
              <DateTimePicker
                value={due}
                mode="date"
                display="default"
                onChange={(_, selected) => {
                  setShowDate(false);
                  if (selected) setDue(selected);
                }}
              />
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={async () => {
                  const parsed = parseDecimalInput(target);
                  if (!title.trim() || !parsed || parsed <= 0) {
                    setDialog({ title: 'Datos incompletos', message: 'Rellena titulo y objetivo.' });
                    return;
                  }
                  await addGoal({ title: title.trim(), target: parsed, due: toIsoDate(due) });
                  setTitle('');
                  setTarget('');
                  setDue(new Date());
                  setOpen(false);
                  show('Objetivo guardado', 'success');
                }}
              >
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
        confirmLabel="Cerrar"
        onConfirm={() => setDialog(null)}
      />
    </SafeAreaView>
  );
};

