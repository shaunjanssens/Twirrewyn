export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistData {
  sections: ChecklistSection[];
}
