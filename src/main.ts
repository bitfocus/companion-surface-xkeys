import type {
	DiscoveredSurfaceInfo,
	HIDDevice,
	OpenSurfaceResult,
	SurfaceContext,
	SurfacePlugin,
} from '@companion-surface/base'
import { XKeysWrapper } from './instance.js'
import { createSurfaceSchema, createTransferVariables } from './surface-schema.js'
import { setupXkeysPanel } from 'xkeys'

const XKeysPlugin: SurfacePlugin<HIDDevice> = {
	init: async (): Promise<void> => {
		// Nothing to do
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	checkSupportsHidDevice: (deviceInfo): DiscoveredSurfaceInfo<HIDDevice> | null => {
		if (deviceInfo.vendorId === 1523 && deviceInfo.interface === 0) {
			// TODO: how to do this
			// const surfaceId = `xkeys:${panel.info.productId}-${panel.info.unitId}` // TODO - this needs some additional uniqueness to the suffix

			return {
				surfaceId: `xkeys:${deviceInfo.path}`, // TODO - this is bad
				description: deviceInfo.product ? `XKeys ${deviceInfo.product}` : 'XKeys Device',
				pluginInfo: deviceInfo,
			}
		} else {
			return null
		}
	},

	openSurface: async (
		surfaceId: string,
		pluginInfo: HIDDevice,
		context: SurfaceContext,
	): Promise<OpenSurfaceResult> => {
		const device = await setupXkeysPanel(pluginInfo.path)

		return {
			surface: new XKeysWrapper(surfaceId, device, context),
			registerProps: {
				brightness: false,
				surfaceLayout: createSurfaceSchema(device.info),
				transferVariables: createTransferVariables(device.info),
				pincodeMap: null,
				configFields: [
					{
						id: 'illuminate_pressed',
						type: 'checkbox',
						label: 'Illuminate pressed buttons',
						default: true,
					},
				],
				location: null,
			},
		}
	},
}
export default XKeysPlugin
