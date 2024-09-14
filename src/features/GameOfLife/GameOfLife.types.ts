export interface Cell {
  alive: boolean;
  color: string | null;
}

export interface GameOfLifeProps {
  size: number;
}
