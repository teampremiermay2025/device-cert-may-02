import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardData {
  id: string;
  title: string;
  count: number;
  statuses: { label: string; count: number; dotColor: 'orange' | 'green' | 'blue' }[];
  buttons: { label: string; style: 'view' | 'action' }[];
}

const SortableCard: React.FC<{
  card: CardData;
  removeCard: (id: string) => void;
  styles: any;
}> = ({ card, removeCard, styles }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const cardStyle = {
    ...styles.card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={cardStyle}>
      <div style={styles.cardHeader}>
        <div></div>
        <button
          style={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            console.log(`Removing card with id: ${card.id}`); // Debug log
            removeCard(card.id);
          }}
        >
          ✕
        </button>
      </div>
      <div style={styles.count}><h2 style={styles.count} {...attributes} {...listeners}>{card.title}</h2>{card.count}</div>
      {card.statuses.map((status, i) => (
        <div key={i} style={styles.status}>
          <span
            style={{
              ...styles.dot,
              ...(status.dotColor === 'orange'
                ? styles.orangeDot
                : status.dotColor === 'green'
                ? styles.greenDot
                : styles.blueDot),
            }}
          ></span>
          {status.label}
          <span style={styles.statusNumber}>{status.count}</span>
        </div>
      ))}
      <div style={styles.actions}>
        {card.buttons.map((button, i) => (
          <button
            key={i}
            style={
              button.style === 'view'
                ? styles.viewButton
                : styles.actionButton
            }
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DashBoardHome = () => {
  const initialCards: CardData[] = [
    {
      id: '1',
      title: 'IoT',
      count: 3,
      statuses: [
        { label: 'DA IR', count: 2, dotColor: 'orange' },
        { label: 'DA EMR', count: 1, dotColor: 'green' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
    {
      id: '2',
      title: 'Non-IoT ',
      count: 8,
      statuses: [
        { label: 'DA IR', count: 7, dotColor: 'orange' },
        { label: 'DA EMR', count: 1, dotColor: 'green' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
    {
      id: '3',
      title: 'Defects ',
      count: 20,
      statuses: [
        { label: 'DA IR', count: 17, dotColor: 'orange' },
        { label: 'DA EMR', count: 3, dotColor: 'blue' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
  ];

  const [cards, setCards] = useState<CardData[]>(initialCards);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedCards = [...cards];
    const [moved] = updatedCards.splice(oldIndex, 1);
    updatedCards.splice(newIndex, 0, moved);
    setCards(updatedCards);
  };

  const removeCard = (id: string) => {
    console.log(`Attempting to remove card with id: ${id}`); // Debug log
    setCards((prev) => {
      const newCards = prev.filter((card) => card.id !== id);
      console.log('Updated cards:', newCards); // Debug log
      return newCards;
    });
  };

  const styles = {
    dashboardContainer: {
      padding: '16px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      color: '#1f2937',
      width: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: 700 as const,
      margin: 0,
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
    },
    actionItems: {
      marginBottom: '16px',
    },
    actionTitle: {
      fontSize: '1rem',
      fontWeight: 600 as const,
      color: 'rgb(37 99 235 / var(--tw-text-opacity, 1)',
      display: 'flex',
      alignItems: 'center',
    },
    actionIcon: {
      color: '#f59e0b',
      marginRight: '6px',
      fontSize: '16px',
    },
    cards: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
      width: '100%',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '1rem',
      padding: '16px',
      maxWidth: '32%',
      minWidth: '32%',
      flex: 1,
      boxShadow:
        '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 500 as const,
      margin: '0 0 12px',
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#6b7280',
    },
    count: {
      fontSize: '28px',
      fontWeight: 700 as const,
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
      marginBottom: '12px',
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '13px',
      marginBottom: '4px',
      color: '#4b5563',
    },
    dot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      marginRight: '6px',
    },
    orangeDot: {
      backgroundColor: '#f97316',
    },
    greenDot: {
      backgroundColor: '#10b981',
    },
    blueDot: {
      backgroundColor: '#3b82f6',
    },
    statusNumber: {
      marginLeft: 'auto',
      fontWeight: 600 as const,
      color: '#374151',
    },
    actions: {
      display: 'flex',
      gap: '32px',
      marginTop: '12px',
      justifyContent: 'center',
    },
    viewButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      color: '#374151',
      fontWeight: 500 as const,
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      backgroundColor: 'rgb(37 99 235 / var(--tw-bg-opacity, 1))',
      border: 'none',
      color: '#ffffff',
      fontWeight: 500 as const,
    },
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Welcome, Michel</h1>
      </div>
      <div style={styles.actionItems}>
        <span style={styles.actionTitle}>
          <span style={styles.actionIcon}>★</span> Prod: Device Pipeline Certification
        </span>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cards.map((card) => card.id)} strategy={horizontalListSortingStrategy}>
            <div style={styles.cards}>
              {cards.map((card) => (
                <SortableCard key={card.id} card={card} removeCard={removeCard} styles={styles} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};