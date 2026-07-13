export interface Individual {
  id: string;
  name: string;
  given: string;
  surname: string;
  sex: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  familiesSpouse: string[];
  familiesChild: string[];
}

export interface Family {
  id: string;
  husband: string | null;
  wife: string | null;
  children: string[];
  marriageDate: string;
}

export function createIndividual(id: string): Individual {
  return {
    id,
    name: '',
    given: '',
    surname: '',
    sex: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    familiesSpouse: [],
    familiesChild: [],
  };
}

export function createFamily(id: string): Family {
  return {
    id,
    husband: null,
    wife: null,
    children: [],
    marriageDate: '',
  };
}

export function displayName(indi: Individual): string {
  return indi.name ? indi.name.replace(/\//g, '').trim() : 'Unknown';
}

export function shortLabel(indi: Individual): string {
  const parts: string[] = [];
  if (indi.given) parts.push(indi.given);
  if (indi.surname) {
    const s = indi.surname.split(',')[0].trim();
    if (s) parts.push(s);
  }
  return parts.length > 0 ? parts.join(' ') : displayName(indi);
}

export function lifeDates(indi: Individual): string {
  const parts: string[] = [];
  if (indi.birthDate) parts.push(indi.birthDate);
  if (indi.deathDate) parts.push(indi.deathDate);
  else if (indi.birthDate) parts.push('?');
  return parts.length > 0 ? parts.join(' — ') : '';
}
