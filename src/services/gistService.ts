import { ChecklistData } from "../types";

const GIST_ID = "986b738df2b3fdd203fce41f5f70de1d";
const GIST_FILENAME = "twirrewyn-checklist.json";
const NOTES_FILENAME = "twirrewyn-notes.txt";

export interface GistResponse {
  files: {
    [key: string]: {
      content: string;
    };
  };
}

export const saveChecklist = async (
  checklist: ChecklistData,
  token: string
) => {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(checklist, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save checklist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving checklist:", error);
    throw error;
  }
};

export const loadChecklist = async (token: string) => {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load checklist");
    }

    const data: GistResponse = await response.json();
    const content = data.files[GIST_FILENAME]?.content;

    if (!content) {
      throw new Error("Checklist file not found in gist");
    }

    return JSON.parse(content) as ChecklistData;
  } catch (error) {
    console.error("Error loading checklist:", error);
    throw error;
  }
};

export const saveNotes = async (notes: string, token: string) => {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [NOTES_FILENAME]: {
            content: notes,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save notes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving notes:", error);
    throw error;
  }
};

export const loadNotes = async (token: string) => {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load notes");
    }

    const data: GistResponse = await response.json();
    const content = data.files[NOTES_FILENAME]?.content;
    return content || "";
  } catch (error) {
    console.error("Error loading notes:", error);
    throw error;
  }
};
