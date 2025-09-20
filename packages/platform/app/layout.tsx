import { AntdRegistry } from '@ant-design/nextjs-registry'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import AuthSessionProvider from '@/components/auth/session-provider'
import PageLayoutWrapper from '@/components/layout/page-layout-wrapper'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'AI中心管理台',
	description: 'AI应用管理平台',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AuthSessionProvider>
					<AntdRegistry>
						<PageLayoutWrapper>{children}</PageLayoutWrapper>
					</AntdRegistry>
				</AuthSessionProvider>
			</body>
		</html>
	)
}
