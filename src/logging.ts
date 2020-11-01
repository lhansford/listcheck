/* eslint-disable fp/no-mutation */
import { IChecklist, ILogEntry, InputValue } from './interfaces';
import { readLog, writeLog } from './io';

function getLogEntry(runId: string): ILogEntry {
  const log = readLog();
  const logEntry = log.entries.find((entry) => entry.id === runId); // TODO: Limit find to first n entries to prevent it taking too long
  if (!logEntry) {
    throw new Error('Could not find log entry');
  }
  return logEntry;
}

function upsertLogEntry(logEntry: ILogEntry): void {
  const log = readLog();
  const entryIndex = log.entries.findIndex((entry) => entry.id === logEntry.id); // TODO: Limit find to first n entries to prevent it taking too long
  if (entryIndex > -1) {
    log.entries[entryIndex] = logEntry;
  } else {
    log.entries = [logEntry, ...log.entries];
  }
  writeLog(log);
}

export function logChecklistStarted(runId: string, checklist: IChecklist): void {
  upsertLogEntry({
    id: runId,
    timeStarted: new Date().valueOf(),
    timeEnded: null,
    checklistName: checklist.name,
    items: [],
  });
}

export function logChecklistFinished(runId: string): void {
  const logEntry = getLogEntry(runId);
  upsertLogEntry({ ...logEntry, timeEnded: new Date().valueOf() });
}

export function logChecklistItemAnswered(
  runId: string,
  itemName: string,
  input: InputValue,
): InputValue {
  const logEntry = getLogEntry(runId);
  upsertLogEntry({ ...logEntry, items: [...logEntry.items, { name: itemName, input }] });
  return input;
}
