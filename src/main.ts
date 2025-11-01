import type {
	DiscoveredSurfaceInfo,
	HIDDevice,
	OpenSurfaceResult,
	SurfaceContext,
	SurfacePlugin,
} from '@companion-surface/base'
import { XKeysWrapper } from './instance.js'
import { createSurfaceSchema, createTransferVariables } from './surface-schema.js'
import { setupXkeysPanel, XKeys } from 'xkeys'

interface XKeysInfo {
	info: NonNullable<ReturnType<typeof XKeys.filterDevice>>
	path: string
}

const XKeysPlugin: SurfacePlugin<XKeysInfo> = {
	init: async (): Promise<void> => {
		// Nothing to do
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	checkSupportsHidDevice: (deviceInfo): DiscoveredSurfaceInfo<XKeysInfo> | null => {
		const surfaceInfo = XKeys.filterDevice(deviceInfo as Required<HIDDevice>)
		if (!surfaceInfo) return null

		const unitId = 0 // TODO - what to do instead of this, as we can't open the panel to check this anymore..
		return {
			surfaceId: `xkeys:${surfaceInfo.productId}-${unitId}`,
			description: `XKeys ${surfaceInfo.product.name}`,
			pluginInfo: {
				path: deviceInfo.path,
				info: surfaceInfo,
			},
		}
	},

	openSurface: async (
		surfaceId: string,
		pluginInfo: XKeysInfo,
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
