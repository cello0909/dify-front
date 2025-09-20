'use server'

import { NextRequest } from 'next/server'

import { createDifyApiResponse, handleApiError, proxyDifyRequest } from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 获取应用站点设置
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string }> },
) {
	try {
		const { appId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 代理请求到 Dify API
		console.log(`[DEBUG] Fetching site settings for app ${appId} from Dify API: ${app.requestConfig.apiBase}/site`)
		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			'/site',
		)

		console.log(`[DEBUG] Dify API response status:`, response.status)
		console.log(`[DEBUG] Dify API response headers:`, Object.fromEntries(response.headers.entries()))

		const data = await response.json()
		console.log(`[DEBUG] Dify API response data:`, JSON.stringify(data, null, 2))

		const apiResponse = createDifyApiResponse(data, response.status)

		// 添加缓存控制头，防止数据被缓存
		apiResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
		apiResponse.headers.set('Pragma', 'no-cache')
		apiResponse.headers.set('Expires', '0')

		console.log(`[DEBUG] Platform API response headers:`, Object.fromEntries(apiResponse.headers.entries()))
		return apiResponse
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(error, `Error fetching app site settings for ${resolvedParams.appId}`)
	}
}
