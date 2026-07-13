import * as crypto from 'crypto';
import { Individual, Family, shortLabel, lifeDates } from './models';

const CARD_W = 180;
const CARD_H = 60;
const AVATAR_R = 20;
const AVATAR_PAD = 10;
const FAMILY_BLOCK_W = 80;
const FAMILY_BLOCK_H = 30;

const COLORS = {
  male: '#a5d8ff',
  female: '#fcc2d7',
  dead: '#dee2e6',
  family: '#d0bfff',
};

const AVATAR_COLORS: Record<string, string> = {
  M: '#74c0fc',
  F: '#f783ac',
  dead: '#adb5bd',
};

function makeId(): string {
  return crypto.randomBytes(10).toString('hex');
}

export function createExcalidraw(
  positions: Map<string, [number, number]>,
  individuals: Map<string, Individual>,
  families: Map<string, Family>,
  _generations: Map<string, number>
) {
  const elements: any[] = [];
  const rectIds = new Map<string, string>();
  const famBlockIds = new Map<string, string>();
  const arrowBindings = new Map<string, string[]>();

  elements.push(...createCards(positions, individuals, rectIds));
  elements.push(...createFamilyBlocks(positions, families, famBlockIds));
  elements.push(...createFamilyLines(positions, families, rectIds, famBlockIds, arrowBindings));

  applyBindings(elements, arrowBindings);

  return {
    type: 'excalidraw',
    version: 2,
    source: 'ged2excalidraw',
    elements,
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: {},
  };
}

function createCards(
  positions: Map<string, [number, number]>,
  individuals: Map<string, Individual>,
  rectIds: Map<string, string>
): any[] {
  const elements: any[] = [];

  for (const [pid, [x, y]] of positions) {
    const indi = individuals.get(pid)!;
    const rectId = makeId();
    rectIds.set(pid, rectId);
    const fill = cardColor(indi);
    const gid = makeId();

    const rect = makeRect(rectId, x, y, CARD_W, CARD_H, fill);
    rect.groupIds = [gid];

    const avatarCx = x + AVATAR_PAD + AVATAR_R;
    const avatarCy = y + CARD_H / 2;
    const avatarId = makeId();
    const avatar = makeCircle(avatarId, avatarCx - AVATAR_R, avatarCy - AVATAR_R, AVATAR_R * 2, AVATAR_R * 2, avatarColor(indi));
    avatar.groupIds = [gid];

    const initialsId = makeId();
    const initials = makeInitials(initialsId, indi, avatarCx, avatarCy, avatarId);
    initials.groupIds = [gid];
    avatar.boundElements = [{ id: initialsId, type: 'text' }];

    const textX = x + AVATAR_PAD + AVATAR_R * 2 + 10;
    const textW = CARD_W - (AVATAR_PAD + AVATAR_R * 2 + 10) - 8;
    const nameId = makeId();
    const text = makeText(nameId, indi, textX, y, textW, rectId);
    text.groupIds = [gid];
    rect.boundElements = [{ id: nameId, type: 'text' }];

    elements.push(rect, avatar, initials, text);
  }

  return elements;
}

function cardColor(indi: Individual): string {
  if (indi.deathDate) return COLORS.dead;
  return indi.sex === 'F' ? COLORS.female : COLORS.male;
}

function avatarColor(indi: Individual): string {
  if (indi.deathDate) return AVATAR_COLORS.dead;
  return AVATAR_COLORS[indi.sex] || AVATAR_COLORS.M;
}

function getInitials(indi: Individual): string {
  const parts: string[] = [];
  if (indi.given) parts.push(indi.given[0]);
  if (indi.surname) {
    const s = indi.surname.split(',')[0].trim();
    if (s) parts.push(s[0]);
  }
  return parts.length > 0 ? parts.join('').toUpperCase() : '?';
}

function makeRect(id: string, x: number, y: number, w: number, h: number, fill: string): any {
  return {
    id, type: 'rectangle', x, y, width: w, height: h,
    angle: 0, strokeColor: '#1e1e1e', backgroundColor: fill,
    fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100, groupIds: [], roundness: { type: 3 },
    seed: 1, version: 1, versionNonce: 1, isDeleted: false,
    boundElements: [], updated: 1, link: null, locked: false,
  };
}

function makeCircle(id: string, x: number, y: number, w: number, h: number, fill: string): any {
  return {
    id, type: 'ellipse', x, y, width: w, height: h,
    angle: 0, strokeColor: '#1e1e1e', backgroundColor: fill,
    fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100, groupIds: [], roundness: { type: 2 },
    seed: 4, version: 1, versionNonce: 4, isDeleted: false,
    boundElements: [], updated: 1, link: null, locked: false,
  };
}

function makeInitials(id: string, indi: Individual, cx: number, cy: number, containerId: string): any {
  const initials = getInitials(indi);
  return {
    id, type: 'text', x: cx - 10, y: cy - 8, width: 20, height: 16,
    angle: 0, strokeColor: '#ffffff', backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100, groupIds: [], roundness: null,
    seed: 5, version: 1, versionNonce: 5, isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false,
    text: initials, fontSize: 14, fontFamily: 1,
    textAlign: 'center', verticalAlign: 'middle',
    containerId, originalText: initials, lineHeight: 1.25,
  };
}

function makeText(id: string, indi: Individual, x: number, y: number, width: number, containerId: string): any {
  const name = shortLabel(indi);
  const life = lifeDates(indi);
  const fullText = life ? `${name}\n${life}` : name;
  return {
    id, type: 'text', x, y: y + 8, width, height: CARD_H - 16,
    angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100, groupIds: [], roundness: null,
    seed: 2, version: 1, versionNonce: 2, isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false,
    text: fullText, fontSize: 12, fontFamily: 1,
    textAlign: 'left', verticalAlign: 'middle',
    containerId, originalText: fullText, lineHeight: 1.25,
  };
}

function createFamilyBlocks(
  positions: Map<string, [number, number]>,
  families: Map<string, Family>,
  famBlockIds: Map<string, string>
): any[] {
  const elements: any[] = [];

  for (const [fid, fam] of families) {
    const parentIds = [fam.husband, fam.wife].filter(p => p && positions.has(p)) as string[];
    const childrenIn = fam.children.filter(c => positions.has(c));
    if (parentIds.length === 0 || childrenIn.length === 0) continue;

    const parentXs = parentIds.map(p => positions.get(p)![0]);
    const parentCx = (Math.min(...parentXs) + Math.max(...parentXs) + CARD_W) / 2;
    const parentYBottom = Math.max(...parentIds.map(p => positions.get(p)![1] + CARD_H));
    const childYTop = Math.min(...childrenIn.map(c => positions.get(c)![1]));
    const blockY = (parentYBottom + childYTop) / 2 - FAMILY_BLOCK_H / 2;
    const blockX = parentCx - FAMILY_BLOCK_W / 2;

    const blockId = makeId();
    famBlockIds.set(fid, blockId);

    const rect = makeRect(blockId, blockX, blockY, FAMILY_BLOCK_W, FAMILY_BLOCK_H, COLORS.family);
    const textId = makeId();
    const text = {
      id: textId, type: 'text', x: blockX + 5, y: blockY + 5,
      width: FAMILY_BLOCK_W - 10, height: FAMILY_BLOCK_H - 10,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
      roughness: 0, opacity: 100, groupIds: [], roundness: null,
      seed: 3, version: 1, versionNonce: 3, isDeleted: false,
      boundElements: null, updated: 1, link: null, locked: false,
      text: 'Семья', fontSize: 12, fontFamily: 1,
      textAlign: 'center', verticalAlign: 'middle',
      containerId: blockId, originalText: 'Семья', lineHeight: 1.25,
    };
    rect.boundElements = [{ id: textId, type: 'text' }];

    elements.push(rect, text);
  }

  return elements;
}

function createFamilyLines(
  positions: Map<string, [number, number]>,
  families: Map<string, Family>,
  rectIds: Map<string, string>,
  famBlockIds: Map<string, string>,
  arrowBindings: Map<string, string[]>
): any[] {
  const elements: any[] = [];

  for (const [fid, fam] of families) {
    if (!famBlockIds.has(fid)) continue;

    const parentIds = [fam.husband, fam.wife].filter(p => p && positions.has(p)) as string[];
    const childrenIn = fam.children.filter(c => positions.has(c));
    if (parentIds.length === 0 || childrenIn.length === 0) continue;

    const blockId = famBlockIds.get(fid)!;

    const parentXs = parentIds.map(p => positions.get(p)![0]);
    const parentCx = (Math.min(...parentXs) + Math.max(...parentXs) + CARD_W) / 2;
    const parentYBottom = Math.max(...parentIds.map(p => positions.get(p)![1] + CARD_H));
    const childYTop = Math.min(...childrenIn.map(c => positions.get(c)![1]));
    const blockCenterX = parentCx;
    const blockTopY = (parentYBottom + childYTop) / 2 - FAMILY_BLOCK_H / 2;
    const blockBottomY = blockTopY + FAMILY_BLOCK_H;

    for (const pid of parentIds) {
      const [px, py] = positions.get(pid)!;
      const arrowId = makeId();
      elements.push(makeBoundArrow(
        arrowId,
        px + CARD_W / 2, py + CARD_H,
        blockCenterX, blockTopY,
        { elementId: rectIds.get(pid)!, focus: 0, gap: 1 },
        { elementId: blockId, focus: 0, gap: 1 },
      ));
      addBinding(arrowBindings, rectIds.get(pid)!, arrowId);
      addBinding(arrowBindings, blockId, arrowId);
    }

    for (const cid of childrenIn) {
      const [cx, cy] = positions.get(cid)!;
      const arrowId = makeId();
      elements.push(makeBoundArrow(
        arrowId,
        blockCenterX, blockBottomY,
        cx + CARD_W / 2, cy,
        { elementId: blockId, focus: 0, gap: 1 },
        { elementId: rectIds.get(cid)!, focus: 0, gap: 1 },
      ));
      addBinding(arrowBindings, blockId, arrowId);
      addBinding(arrowBindings, rectIds.get(cid)!, arrowId);
    }
  }

  return elements;
}

function makeBoundArrow(
  id: string, startX: number, startY: number, endX: number, endY: number,
  startBinding: any, endBinding: any
): any {
  const dx = endX - startX;
  const dy = endY - startY;
  return {
    id, type: 'arrow', x: startX, y: startY,
    width: Math.abs(dx), height: Math.abs(dy),
    points: [[0, 0], [dx, dy]],
    angle: 0, strokeColor: '#868e96', backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100, groupIds: [], roundness: { type: 2 },
    seed: 7, version: 1, versionNonce: 7, isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false,
    startBinding, endBinding, lastCommittedPoint: null,
    startArrowhead: null, endArrowhead: 'arrow',
  };
}

function addBinding(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function applyBindings(elements: any[], arrowBindings: Map<string, string[]>): void {
  const idToElem = new Map(elements.map(e => [e.id, e]));
  for (const [rectId, arrowIds] of arrowBindings) {
    const rect = idToElem.get(rectId);
    if (!rect) continue;
    const be = rect.boundElements ?? [];
    for (const aid of arrowIds) {
      be.push({ id: aid, type: 'arrow' });
    }
    rect.boundElements = be;
  }
}
