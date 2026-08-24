export interface Relation {
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
}

export interface CreateRelationDto {
  name: string;
  sourceId: string;
  targetId: string;
}

export interface CreateRelationFormDto {
  name: string;
}