import {
	CardGenerator,
	HostCapabilities,
	SurfaceDrawProps,
	SurfaceContext,
	SurfaceInstance,
	parseColor,
	ModuleLogger,
	createModuleLogger,
	RgbColor,
} from '@companion-surface/base'
import type { XKeys, Color as XKeysColor } from 'xkeys'
import { createControlId, parseControlId } from './util.js'

export class XKeysWrapper implements SurfaceInstance {
	readonly #logger: ModuleLogger

	readonly #device: XKeys
	readonly #surfaceId: string
	// readonly #context: SurfaceContext

	/**
	 * Last drawn colors to the device
	 */
	readonly #lastColors: Array<XKeysColor | undefined> = []

	/**
	 * Current pressed button indices
	 */
	readonly #pressed = new Set<number>()

	readonly #config = {
		brightness: 100,
		illuminatePressed: true,
	}

	public get surfaceId(): string {
		return this.#surfaceId
	}
	public get productName(): string {
		return `XKeys ${this.#device.info.name}`
	}

	public constructor(surfaceId: string, deck: XKeys, context: SurfaceContext) {
		this.#logger = createModuleLogger(`XKeys/${surfaceId}`)
		this.#device = deck
		this.#surfaceId = surfaceId
		// this.#context = context

		this.#device.on('error', (e) => context.disconnect(e))

		this.#device.on('disconnected', () => {
			this.#logger.debug(`X-keys panel of type ${this.#device.info.name} was disconnected`)
			// Clean up stuff
			this.#device.removeAllListeners()
			context.disconnect(new Error('X-keys panel disconnected'))
		})

		this.#device.on('error', (err) => {
			this.#logger.error(`X-keys error: ${err}`)
			context.disconnect(err instanceof Error ? err : new Error(String(err)))
		})

		// Listen to pressed buttons:
		this.#device.on('down', (keyIndex, metadata) => {
			const controlId = createControlId(metadata)
			this.#logger.debug(`keyIndex: ${keyIndex}. Id: ${controlId}`)
			this.#pressed.add(keyIndex)

			context.keyDownById(controlId)

			// Light up a button when pressed:
			try {
				this.#device.setIndicatorLED(1, true)
				if (this.#config.illuminatePressed) {
					this.#device.setBacklight(keyIndex, 'red')
				}
			} catch (e) {
				this.#logger.debug(`Failed to set indicator: ${e}`)
			}
		})

		// Listen to released buttons:
		this.#device.on('up', (keyIndex, metadata) => {
			const controlId = createControlId(metadata)
			this.#logger.debug(`keyIndex: ${keyIndex}. Id: ${controlId}`)
			this.#pressed.delete(keyIndex)

			context.keyUpById(controlId)

			// Turn off button light when released:
			try {
				this.#device.setIndicatorLED(1, false)
				if (this.#config.illuminatePressed) {
					this.#device.setBacklight(keyIndex, this.#lastColors[keyIndex] || false)
				}
			} catch (e) {
				this.#logger.debug(`Failed to set indicator: ${e}`)
			}
		})

		// Listen to jog wheel changes:
		if (this.#device.info.hasJog) {
			this.#device.on('jog', (index, deltaPos, _metadata) => {
				this.#logger.debug(`Jog ${index} position has changed: ${deltaPos}`)
				context.sendVariableValue('jogValueVariable', deltaPos)
				setTimeout(() => {
					context.sendVariableValue('jogValueVariable', 0)
				}, 20)
			})
		}

		// Listen to shuttle changes:
		if (this.#device.info.hasShuttle) {
			this.#device.on('shuttle', (index, shuttlePos, _metadata) => {
				this.#logger.debug(`Shuttle ${index} position has changed: ${shuttlePos}`)
				context.sendVariableValue('shuttleValueVariable', shuttlePos)
			})
		}
		// Listen to joystick changes:
		if (this.#device.info.hasJoystick) {
			this.#device.on('joystick', (index, position, _metadata) => {
				this.#logger.debug(`Joystick ${index} position has changed: ${JSON.stringify(position)}`) // {x, y, z}
				//TODO
				// this.emit('setVariable', 'joystick', position)
			})
		}
		if (this.#device.info.hasTbar) {
			// Listen to t-bar changes:
			this.#device.on('tbar', (index, position, _metadata) => {
				this.#logger.debug(`T-bar ${index} position has changed: ${position}`)
				context.sendVariableValue('tbarValueVariable', position)
			})
		}
	}

	async init(): Promise<void> {
		// Start with blanking it
		await this.blank()
	}
	async close(): Promise<void> {
		await this.blank().catch(() => null)

		await this.#device.close()
	}

	async updateConfig(config: Record<string, any>): Promise<void> {
		this.#config.illuminatePressed = config.illuminate_pressed ?? true

		// Resync the brightness
		await this.setBrightness(this.#config.brightness)
	}

	updateCapabilities(_capabilities: HostCapabilities): void {
		// Not used
	}

	async ready(): Promise<void> {}

	async setBrightness(percent: number): Promise<void> {
		this.#config.brightness = percent

		const intensity = this.#config.brightness * 2.55
		this.#device.setBacklightIntensity(intensity, this.#config.illuminatePressed ? 255 : intensity)
	}
	async blank(): Promise<void> {
		const { colCount, rowCount } = this.#device.info

		for (let keyIndex = 1; keyIndex <= colCount * rowCount; keyIndex++) {
			this.#device.setBacklight(keyIndex, false)
		}
	}
	async draw(_signal: AbortSignal, drawProps: SurfaceDrawProps): Promise<void> {
		const { x, y } = parseControlId(drawProps.controlId)
		if (x < 0 || y < 0 || x >= this.#device.info.colCount || y >= this.#device.info.rowCount) return

		const buttonIndex = x * this.#device.info.rowCount + y + 1
		this.#drawColorAtIndex(buttonIndex, parseColor(drawProps.color))
	}

	/**
	 * Set the color of a button by device index
	 * @param buttonIndex
	 * @param color 24bit colour value
	 */
	#drawColorAtIndex(buttonIndex: number | undefined, color: RgbColor): void {
		if (buttonIndex === undefined) return

		const tmpColor = { ...color }
		if (this.#pressed.has(buttonIndex) && this.#config.illuminatePressed) tmpColor.r = 255

		try {
			this.#device.setBacklight(buttonIndex, tmpColor)
		} catch (e) {
			this.#logger.debug(`Failed to set backlight: ${e}`)
		}

		this.#lastColors[buttonIndex] = color
	}

	async showStatus(_signal: AbortSignal, _cardGenerator: CardGenerator): Promise<void> {
		// Nothing to display here
		// TODO - do some flashing lights to indicate each status?
	}
}
