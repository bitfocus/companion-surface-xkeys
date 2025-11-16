// @ts-check

// eslint-disable-next-line n/no-extraneous-import
import { PRODUCTS, XKEYS_VENDOR_ID } from '@xkeys-lib/core'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
// eslint-disable-next-line n/no-unpublished-import
import prettier from 'prettier'

const manifestPath = path.join(import.meta.dirname, '../companion/manifest.json')

/** @type {import('@companion-surface/base').SurfaceModuleManifestUsbIds} */
const usbIds = {
	vendorId: XKEYS_VENDOR_ID,
	productIds: [0], // Fix
}

for (const product of Object.values(PRODUCTS)) {
	usbIds.productIds.push(...product.hidDevices.map((d) => d[0]))
}

// Remove duplicates
// @ts-expect-error minimum 1 required
usbIds.productIds = Array.from(new Set(usbIds.productIds))

/** @type {import('@companion-surface/base').SurfaceModuleManifest} */
const manifest = JSON.parse(await readFileSync(manifestPath, 'utf8'))

const manifestStr = JSON.stringify({
	...manifest,
	usbIds: [usbIds],
})

const prettierConfig = await prettier.resolveConfig(manifestPath)

const formatted = await prettier.format(manifestStr, {
	...prettierConfig,
	parser: 'json',
})

writeFileSync(manifestPath, formatted)
