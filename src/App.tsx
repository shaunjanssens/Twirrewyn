import { useState, useEffect, useCallback } from "react";
import { ChecklistData, ChecklistSection } from "./types";
import { saveChecklist, loadChecklist } from "./services/gistService";
import { Header } from "./components/Header";
import { ChecklistSection as ChecklistSectionComponent } from "./components/ChecklistSection";
import { TokenForm } from "./components/TokenForm";
import Notes from "./components/Notes";
import Weather from "./components/Weather";
import "./App.css";

function App() {
  const [checklist, setChecklist] = useState<ChecklistData>({ sections: [] });
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newlyAddedSectionId, setNewlyAddedSectionId] = useState<string | null>(
    null
  );
  const [newlyAddedItemId, setNewlyAddedItemId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("github-token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setShowTokenForm(true);
    }
  }, []);

  const loadChecklistFromGist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loadChecklist(token);
      setChecklist(data);
    } catch (err) {
      setError("Failed to load checklist from GitHub");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadChecklistFromGist();
    }
  }, [token, loadChecklistFromGist]);

  const saveChecklistToGist = async (newChecklist: ChecklistData) => {
    try {
      await saveChecklist(newChecklist, token);
    } catch (err) {
      setError("Failed to save checklist to GitHub");
      console.error(err);
      // Revert to the last known good state
      setChecklist(checklist);
    }
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    // Optimistically update the UI
    const newChecklist = {
      ...checklist,
      sections: checklist.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, completed: !item.completed };
              }
              return item;
            }),
          };
        }
        return section;
      }),
    };
    setChecklist(newChecklist);

    // Save in the background
    saveChecklistToGist(newChecklist);
  };

  const resetChecklist = () => {
    if (
      window.confirm("Are you sure you want to reset the entire checklist?")
    ) {
      const resetChecklist = {
        ...checklist,
        sections: checklist.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => ({ ...item, completed: false })),
        })),
      };
      setChecklist(resetChecklist);
      saveChecklistToGist(resetChecklist);
    }
  };

  const handleTokenSubmit = (newToken: string) => {
    localStorage.setItem("github-token", newToken);
    setToken(newToken);
    setShowTokenForm(false);
  };

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const handleLogout = () => {
    localStorage.removeItem("github-token");
    setToken("");
    setShowTokenForm(true);
  };

  const editSection = (sectionId: string, newTitle: string) => {
    const newChecklist = {
      ...checklist,
      sections: checklist.sections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      ),
    };
    setChecklist(newChecklist);
    saveChecklistToGist(newChecklist);
  };

  const editItem = (sectionId: string, itemId: string, newText: string) => {
    const newChecklist = {
      ...checklist,
      sections: checklist.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, text: newText } : item
            ),
          };
        }
        return section;
      }),
    };
    setChecklist(newChecklist);
    saveChecklistToGist(newChecklist);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "",
      items: [],
    };
    const newChecklist = {
      ...checklist,
      sections: [...checklist.sections, newSection],
    };
    setChecklist(newChecklist);
    setNewlyAddedSectionId(newSection.id);
    setNewlyAddedItemId(null);
    saveChecklistToGist(newChecklist);
  };

  const addItem = (sectionId: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      text: "",
      completed: false,
    };
    const newChecklist = {
      ...checklist,
      sections: checklist.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [...section.items, newItem],
          };
        }
        return section;
      }),
    };
    setChecklist(newChecklist);
    setNewlyAddedSectionId(null);
    setNewlyAddedItemId(newItem.id + "@" + sectionId);
    saveChecklistToGist(newChecklist);
  };

  const removeSection = (sectionId: string) => {
    if (window.confirm("Are you sure you want to remove this section?")) {
      const newChecklist = {
        ...checklist,
        sections: checklist.sections.filter(
          (section) => section.id !== sectionId
        ),
      };
      setChecklist(newChecklist);
      saveChecklistToGist(newChecklist);
    }
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      const newChecklist = {
        ...checklist,
        sections: checklist.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            };
          }
          return section;
        }),
      };
      setChecklist(newChecklist);
      saveChecklistToGist(newChecklist);
    }
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const currentIndex = checklist.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === checklist.sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...checklist.sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    const newChecklist = {
      ...checklist,
      sections: newSections,
    };
    setChecklist(newChecklist);
    saveChecklistToGist(newChecklist);
  };

  const moveItem = (
    sectionId: string,
    itemId: string,
    direction: "up" | "down"
  ) => {
    const section = checklist.sections.find(
      (section) => section.id === sectionId
    );
    if (!section) return;

    const currentIndex = section.items.findIndex((item) => item.id === itemId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === section.items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newSections = checklist.sections.map((s) => {
      if (s.id === sectionId) {
        const newItems = [...s.items];
        const [movedItem] = newItems.splice(currentIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return { ...s, items: newItems };
      }
      return s;
    });

    const newChecklist = {
      ...checklist,
      sections: newSections,
    };
    setChecklist(newChecklist);
    saveChecklistToGist(newChecklist);
  };

  if (showTokenForm) {
    return <TokenForm onSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="app">
      <Header
        onReset={resetChecklist}
        onLogout={handleLogout}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="spinner" />}
      <main>
        {checklist.sections.map((section: ChecklistSection) => (
          <ChecklistSectionComponent
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onToggle={toggleSection}
            onToggleItem={toggleItem}
            isEditMode={isEditMode}
            onEditSection={editSection}
            onEditItem={editItem}
            onAddItem={addItem}
            onRemoveSection={removeSection}
            onRemoveItem={removeItem}
            onMoveSection={moveSection}
            onMoveItem={moveItem}
            autoEditSection={newlyAddedSectionId === section.id}
            autoEditItemId={
              newlyAddedItemId &&
              newlyAddedItemId.startsWith("item-") &&
              newlyAddedItemId.endsWith("@" + section.id)
                ? newlyAddedItemId.split("@")[0]
                : null
            }
            clearAutoEdit={() => {
              setNewlyAddedSectionId(null);
              setNewlyAddedItemId(null);
            }}
          />
        ))}
        {isEditMode && (
          <div className="add-section">
            <button onClick={addSection}>+ Add Section</button>
          </div>
        )}
      </main>
      <footer>
        <Notes token={token} />
        <Weather />
      </footer>
    </div>
  );
}

export default App;
