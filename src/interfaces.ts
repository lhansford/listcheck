export interface IChecklistItem {
  key: string;
  label: string;
}

export interface IChecklist {
  version: 1;
  name: string;
  items: IChecklistItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputValue = any;

export interface ILogEntry {
  id: string;
  checklistName: string;
  timeStarted: number;
  timeEnded: number | null;
  items: { name: string; input: InputValue }[];
}

export interface ILog {
  version: 1;
  entries: ILogEntry[];
}

export enum ChecklistResponse {
  NOT_FOUND = 0,
  NO_CHECKLISTS,
}
