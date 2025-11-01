import type {
	SurfaceInputVariable,
	SurfaceOutputVariable,
	SurfaceSchemaLayoutDefinition,
} from '@companion-surface/base'
import type { XKeysInfo } from 'xkeys'
import { createControlId } from './util.js'

export function createSurfaceSchema(info: XKeysInfo): SurfaceSchemaLayoutDefinition {
	const surfaceLayout: SurfaceSchemaLayoutDefinition = {
		stylePresets: {
			default: {
				colors: 'hex',
			},
		},
		controls: {},
	}

	for (let row = 1; row <= info.rowCount; row++) {
		for (let col = 1; col <= info.colCount; col++) {
			const controlId = createControlId({ row, col })
			surfaceLayout.controls[controlId] = {
				row: row - 1,
				column: col - 1,
			}
		}
	}

	return surfaceLayout
}

export function createTransferVariables(info: XKeysInfo): Array<SurfaceInputVariable | SurfaceOutputVariable> {
	const variables: Array<SurfaceInputVariable | SurfaceOutputVariable> = []

	if (info.hasJog) {
		variables.push({
			type: 'input',
			id: 'jogValueVariable',
			name: 'Variable to store Jog value to',
			description: 'This will pulse with -1 or 1 before returning to 0 when rotated.',
		})
	}

	if (info.hasShuttle) {
		variables.push({
			type: 'input',
			id: 'shuttleValueVariable',
			name: 'Variable to store Shuttle value to',
			description:
				'This produces a value between -7 and 7. You can use an expression to convert it into a different range.',
		})
	}

	if (info.hasTbar) {
		variables.push({
			type: 'input',
			id: 'tbarValueVariable',
			name: 'Variable to store T-Bar value to',
			description:
				'This produces a value between 0 and 255. You can use an expression to convert it into a different range.',
		})
	}

	return variables
}
