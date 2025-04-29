import { useState } from "react";
import { ChecklistSection as ChecklistSectionType } from "../types";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  isActive: boolean;
  onToggle: (sectionId: string) => void;
  onToggleItem: (sectionId: string, itemId: string) => void;
  isEditMode: boolean;
  onEditSection: (sectionId: string, newTitle: string) => void;
  onEditItem: (sectionId: string, itemId: string, newText: string) => void;
  onAddItem: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onMoveItem: (
    sectionId: string,
    itemId: string,
    direction: "up" | "down"
  ) => void;
}

export function ChecklistSection({
  section,
  isActive,
  onToggle,
  onToggleItem,
  isEditMode,
  onEditSection,
  onEditItem,
  onAddItem,
  onRemoveSection,
  onRemoveItem,
  onMoveSection,
  onMoveItem,
}: ChecklistSectionProps) {
  const [editingSection, setEditingSection] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSectionEdit = () => {
    setEditingSection(true);
    setEditText(section.title);
  };

  const handleSectionSave = () => {
    if (editText.trim()) {
      onEditSection(section.id, editText);
    }
    setEditingSection(false);
  };

  const handleItemEdit = (itemId: string, currentText: string) => {
    setEditingItem(itemId);
    setEditText(currentText);
  };

  const handleItemSave = (itemId: string) => {
    if (editText.trim()) {
      onEditItem(section.id, itemId, editText);
    }
    setEditingItem(null);
  };

  const handleInputBlur = (
    e: React.FocusEvent,
    type: "section" | "item",
    itemId?: string
  ) => {
    // Check if the related target is the remove button
    const target = e.relatedTarget as HTMLElement;
    if (target?.classList.contains("remove-button")) {
      return;
    }

    if (type === "section") {
      handleSectionSave();
    } else if (itemId) {
      handleItemSave(itemId);
    }
  };

  const handleRemoveSection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveSection(section.id);
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveItem(section.id, itemId);
  };

  const allItemsChecked =
    section.items.length > 0 && section.items.every((item) => item.completed);

  return (
    <section className="checklist-section">
      <h2 onClick={() => onToggle(section.id)}>
        {editingSection ? (
          <div className="edit-container">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={(e) => handleInputBlur(e, "section")}
              onKeyDown={(e) => e.key === "Enter" && handleSectionSave()}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            {isEditMode && (
              <button className="remove-button" onClick={handleRemoveSection}>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <>
            <span className={allItemsChecked ? "completed" : ""}>
              {section.title}
            </span>
            <div className="section-actions">
              {isEditMode && (
                <>
                  <button
                    className="move-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveSection(section.id, "up");
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                    </svg>
                  </button>
                  <button
                    className="move-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveSection(section.id, "down");
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                    </svg>
                  </button>
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSectionEdit();
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                </>
              )}
              <span className="section-toggle">{isActive ? "−" : "+"}</span>
            </div>
          </>
        )}
      </h2>
      <ul style={{ display: isActive ? "block" : "none" }}>
        {section.items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                id={`${section.id}-${item.id}`}
                name={`${section.id}-${item.id}`}
                checked={item.completed}
                onChange={() => onToggleItem(section.id, item.id)}
              />
              {editingItem === item.id ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={(e) => handleInputBlur(e, "item", item.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleItemSave(item.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {isEditMode && (
                    <button
                      className="remove-button"
                      onClick={(e) => handleRemoveItem(e, item.id)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <span className={item.completed ? "completed" : ""}>
                    {item.text}
                  </span>
                  {isEditMode && (
                    <div className="item-actions">
                      <button
                        className="move-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMoveItem(section.id, item.id, "up");
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        </svg>
                      </button>
                      <button
                        className="move-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMoveItem(section.id, item.id, "down");
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                        </svg>
                      </button>
                      <button
                        className="edit-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleItemEdit(item.id, item.text);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </label>
          </li>
        ))}
        {isEditMode && (
          <li className="add-item">
            <button onClick={() => onAddItem(section.id)}>+ Add Item</button>
          </li>
        )}
      </ul>
    </section>
  );
}
