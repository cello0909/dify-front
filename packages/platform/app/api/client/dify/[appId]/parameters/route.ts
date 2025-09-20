'use server'

import { NextRequest, NextResponse } from 'next/server'

import { getAppItem } from '@/repository/app'

/**
 * 代理 Dify API 的应用参数请求
 *
 * @param request NextRequest 对象
 * @param params 包含应用 ID 的参数对象
 * @returns 来自 Dify API 的应用参数
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
			return NextResponse.json({ error: 'App not found' }, { status: 404 })
		}

		// 转发请求到 Dify API
		const url = `${app.requestConfig.apiBase}/parameters`
		console.log(`[DEBUG] Fetching parameters for app ${appId} from Dify API: ${url}`)

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${app.requestConfig.apiKey}`,
			},
		})

		console.log(`[DEBUG] Dify API response status:`, response.status)
		console.log(`[DEBUG] Dify API response headers:`, Object.fromEntries(response.headers.entries()))

		const data = await response.json()
		console.log(`[DEBUG] Dify API response data:`, JSON.stringify(data, null, 2))

		// 返回响应
		const apiResponse = NextResponse.json(data, { status: response.status })
		console.log(`[DEBUG] Platform API response headers:`, Object.fromEntries(apiResponse.headers.entries()))
		return apiResponse
	} catch (error) {
		console.error(`Error fetching app parameters from Dify API:`, error)
		return NextResponse.json({ error: 'Failed to fetch app parameters' }, { status: 500 })
	}
}
