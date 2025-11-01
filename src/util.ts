import type { ButtonEventMetadata } from 'xkeys'

export function createControlId(md: Pick<ButtonEventMetadata, 'row' | 'col'>): string {
	return `${md.row - 1}/${md.col - 1}`
}

export function parseControlId(controlId: string): { y: number; x: number } {
	const [rowStr, colStr] = controlId.split('/')
	return {
		y: parseInt(rowStr, 10),
		x: parseInt(colStr, 10),
	}
}
