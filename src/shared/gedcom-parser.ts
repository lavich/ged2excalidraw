import { Individual, Family, createIndividual, createFamily } from './models';

export function parseGedcom(content: string): { individuals: Map<string, Individual>; families: Map<string, Family> } {
  const individuals = new Map<string, Individual>();
  const families = new Map<string, Family>();

  let currentRecord: string | null = null;
  let currentType: 'INDI' | 'FAM' | null = null;
  let currentSubTag: string | null = null;

  const regex = /^(\d+)\s+(@\w+@)?\s*(\w+)\s*(.*)?$/;
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    const m = line.match(regex);
    if (!m) continue;

    const level = parseInt(m[1], 10);
    const xref = m[2] || null;
    const tag = m[3];
    const value = (m[4] || '').trim();

    if (level === 0) {
      currentSubTag = null;
      if (tag === 'INDI' && xref) {
        currentType = 'INDI';
        currentRecord = xref;
        individuals.set(xref, createIndividual(xref));
      } else if (tag === 'FAM' && xref) {
        currentType = 'FAM';
        currentRecord = xref;
        families.set(xref, createFamily(xref));
      } else {
        currentType = null;
        currentRecord = null;
      }
      continue;
    }

    if (currentRecord === null) continue;

    if (currentType === 'INDI') {
      parseIndividual(individuals.get(currentRecord)!, level, tag, value, currentSubTag);
      if (level === 1) currentSubTag = tag;
    } else if (currentType === 'FAM') {
      parseFamily(families.get(currentRecord)!, level, tag, value, currentSubTag);
      if (level === 1) currentSubTag = tag;
    }
  }

  return { individuals, families };
}

function parseIndividual(indi: Individual, level: number, tag: string, value: string, subTag: string | null): void {
  if (level === 1) {
    switch (tag) {
      case 'NAME': indi.name = value; break;
      case 'SEX': indi.sex = value; break;
      case 'DEAT': if (value === 'Y') indi.deathDate = '?'; break;
      case 'FAMS': indi.familiesSpouse.push(value); break;
      case 'FAMC': indi.familiesChild.push(value); break;
    }
  } else if (level === 2) {
    if (subTag === 'NAME') {
      if (tag === 'GIVN') indi.given = value;
      else if (tag === 'SURN') indi.surname = value;
    } else if (subTag === 'BIRT') {
      if (tag === 'DATE') indi.birthDate = value;
      else if (tag === 'PLAC') indi.birthPlace = value;
    } else if (subTag === 'DEAT' && tag === 'DATE') {
      indi.deathDate = value;
    }
  }
}

function parseFamily(fam: Family, level: number, tag: string, value: string, subTag: string | null): void {
  if (level === 1) {
    switch (tag) {
      case 'HUSB': fam.husband = value; break;
      case 'WIFE': fam.wife = value; break;
      case 'CHIL': fam.children.push(value); break;
    }
  } else if (level === 2 && subTag === 'MARR' && tag === 'DATE') {
    fam.marriageDate = value;
  }
}
