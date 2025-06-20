'use client';

import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Rocket, Code, Zap, Users, Settings, HelpCircle } from "lucide-react";
import { FaqSection } from "@/components/ui/faq";
import { SiReact, SiAngular, SiVuedotjs, SiSvelte } from "react-icons/si";

const sections = [
	{ key: "overview", label: "Overview", icon: Rocket },
	{ key: "installation", label: "Installation", icon: Zap },
	{ key: "usage", label: "Usage", icon: Code },
	{ key: "react", label: "React", icon: SiReact },
	{ key: "angular", label: "Angular", icon: SiAngular },
	{ key: "vue", label: "Vue 3", icon: SiVuedotjs },
	{ key: "svelte", label: "Svelte", icon: SiSvelte },
	{ key: "api", label: "API", icon: Settings },
	{ key: "identity", label: "Identity", icon: Users },
	{ key: "faq", label: "FAQ", icon: HelpCircle },
];

export default function DocumentationPage() {
	const [activeSection, setActiveSection] = useState("overview");

	useEffect(() => {
		const handleScroll = () => {
			let current = "overview";
			for (const { key } of sections) {
				const el = document.getElementById(key);
				if (el) {
					const rect = el.getBoundingClientRect();
					if (rect.top <= 120) {
						current = key;
					}
				}
			}
			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - 10
			) {
				current = sections[sections.length - 1].key;
			}
			setActiveSection(current);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Highlight on sidebar click
	const handleSidebarClick = (key: string) => {
		setActiveSection(key);
	};

	return (
		<div className="relative min-h-screen">
			{/* Main content */}
			<div className="p-6 pb-64">
				<div className="max-w-4xl mx-auto pr-0 md:pr-64">
					{/* Section: Overview */}
					<section id="overview" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<Rocket className="w-6 h-6 text-black" />
							GradualRollout SDK
						</h2>
						<p className="mb-4 text-lg text-gray-700">
							A lightweight, framework-agnostic JavaScript and TypeScript SDK for feature flagging and canary deployments. Enable safe, gradual feature rollouts with instant evaluation and real-time updates.
						</p>
						<ul className="list-disc ml-6 text-gray-700">
							<li>Connects seamlessly with your GradualRollout backend API</li>
							<li>Framework agnostic: use with React, Angular, Vue, or vanilla JS</li>
							<li>Consistent user bucketing via hashing for percentage rollouts</li>
							<li>Event-driven API with <code>flagsUpdated</code>, <code>error</code>, and <code>initialized</code> events</li>
							<li>Automatic polling with configurable interval and manual refresh support</li>
							<li>Simple to initialize and use with TypeScript support</li>
							<li><b>Dynamic user identity support:</b> works with anonymous users (<code>anonId</code>) before login and updates seamlessly post-login (<code>userId</code>)</li>
						</ul>
					</section>
					<Separator className="my-8" />
					{/* Section: Installation */}
					<section id="installation" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<Zap className="w-6 h-6 text-black" />
							Installation
						</h2>
						<pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto mb-4"><code>npm install gradual-rollout-sdk</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: Usage */}
					<section id="usage" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<Code className="w-6 h-6 text-black" />
							Usage
						</h2>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4"><code>{`import { GradualRolloutSDK } from 'gradual-rollout-sdk';

const sdk = new GradualRolloutSDK({
  apiKey: 'your_api_key',
  userId: 'user_123',
  pollingIntervalMs: 30000, // optional, default 60000 (60s)
});

sdk.on('initialized', () => {
  console.log('SDK initialized');
});

sdk.on('flagsUpdated', (flags) => {
  console.log('Flags updated:', flags);
});

sdk.on('error', (error) => {
  console.error('SDK error:', error);
});

await sdk.init();

const isNewFeatureEnabled = sdk.isFeatureEnabled('new-feature');

if (isNewFeatureEnabled) {
  // Show new UI or enable feature
}

// Manually refresh flags anytime
await sdk.refreshFlags();

// When done with SDK (e.g., on app unload), clean up
sdk.destroy();`}</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: React */}
					<section id="react" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<SiReact className="w-6 h-6 text-black" />
							React Integration
						</h2>
						<p className="mb-2 text-gray-700">Easy integration with React using context and hooks.</p>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4"><code>{`// GradualRolloutProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { GradualRolloutSDK, FeatureFlag } from 'gradual-rollout-sdk';
import { v4 as uuidv4 } from 'uuid';

interface GradualRolloutContextType {
  sdk: GradualRolloutSDK | null;
  flags: FeatureFlag[];
  isFeatureEnabled: (flagKey: string) => boolean;
  refreshFlags: () => Promise<void>;
  initialized: boolean;
  error: Error | null;
}

const GradualRolloutContext = createContext<GradualRolloutContextType | undefined>(undefined);

function useAnonId() {
  const [anonId, setAnonId] = useState<string | null>(null);
  useEffect(() => {
    let storedAnonId = localStorage.getItem('anon_id');
    if (!storedAnonId) {
      storedAnonId = uuidv4();
      localStorage.setItem('anon_id', storedAnonId);
    }
    setAnonId(storedAnonId);
  }, []);
  return anonId;
}

export const GradualRolloutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const anonId = useAnonId();
  const [sdk, setSdk] = useState<GradualRolloutSDK | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!anonId) return;
    const instance = new GradualRolloutSDK({
      apiKey: 'YOUR_API_KEY', // Replace with your actual API key
      anonId,
      pollingIntervalMs: 60000,
    });
    setSdk(instance);
    const handleFlagsUpdated = (newFlags: FeatureFlag[]) => setFlags(newFlags);
    const handleInitialized = () => setInitialized(true);
    const handleError = (err: Error) => setError(err);
    instance.on('flagsUpdated', handleFlagsUpdated);
    instance.on('initialized', handleInitialized);
    instance.on('error', handleError);
    instance.init();
    return () => {
      instance.off('flagsUpdated', handleFlagsUpdated);
      instance.off('initialized', handleInitialized);
      instance.off('error', handleError);
      instance.destroy();
    };
  }, [anonId]);

  const isFeatureEnabled = useCallback(
    (flagKey: string) => (sdk ? sdk.isFeatureEnabled(flagKey) : false),
    [sdk]
  );

  const refreshFlags = useCallback(async () => {
    if (sdk) await sdk.refreshFlags();
  }, [sdk]);

  const value = useMemo(
    () => ({ sdk, flags, isFeatureEnabled, refreshFlags, initialized, error }),
    [sdk, flags, isFeatureEnabled, refreshFlags, initialized, error]
  );

  return (
    <GradualRolloutContext.Provider value={value}>
      {children}
    </GradualRolloutContext.Provider>
  );
};

export function useGradualRollout() {
  const context = useContext(GradualRolloutContext);
  if (context === undefined) {
    throw new Error('useGradualRollout must be used within a GradualRolloutProvider');
  }
  return context;
}`}</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: Angular */}
					<section id="angular" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<SiAngular className="w-6 h-6 text-black" />
							Angular Integration
						</h2>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4"><code>{`// rollout.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GradualRolloutSDK, FeatureFlag } from 'gradual-rollout-sdk';

@Injectable({ providedIn: 'root' })
export class RolloutService implements OnDestroy {
  private sdk = new GradualRolloutSDK({ apiKey: 'YOUR_API_KEY', anonId: this.getAnonId() });
  public flags$ = new BehaviorSubject<FeatureFlag[]>([]);
  public ready$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.sdk.on('flagsUpdated', flags => this.flags$.next(flags));
    this.sdk.on('initialized', () => this.ready$.next(true));
    this.sdk.on('error', err => console.error('[Rollout]', err));
    this.sdk.init();
  }

  private getAnonId(): string {
    return localStorage.getItem('anon_id') || crypto.randomUUID();
  }

  isFeatureEnabled(key: string): boolean {
    return this.sdk.isFeatureEnabled(key);
  }

  refresh(): Promise<void> {
    return this.sdk.refreshFlags();
  }

  ngOnDestroy() {
    this.sdk.destroy();
  }
}`}</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: Vue */}
					<section id="vue" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<SiVuedotjs className="w-6 h-6 text-black" />
							Vue 3 Integration
						</h2>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4"><code>{`// rollout.ts
import { App, reactive } from 'vue';
import { GradualRolloutSDK, FeatureFlag } from 'gradual-rollout-sdk';

export interface RolloutState {
  ready: boolean;
  flags: FeatureFlag[];
}
export const rolloutState = reactive<RolloutState>({ ready: false, flags: [] });

export default {
  install(app: App) {
    const sdk = new GradualRolloutSDK({ apiKey: 'YOUR_API_KEY', anonId: crypto.randomUUID() });
    sdk.on('initialized', () => (rolloutState.ready = true));
    sdk.on('flagsUpdated', f => (rolloutState.flags = f));
    sdk.on('error', console.error);
    sdk.init();
    app.config.globalProperties.$rollout = sdk;
  }
};`}</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: Svelte */}
					<section id="svelte" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<SiSvelte className="w-6 h-6 text-black" />
							Svelte Integration
						</h2>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4"><code>{`// rollout.ts
import { writable } from 'svelte/store';
import { GradualRolloutSDK, FeatureFlag } from 'gradual-rollout-sdk';

export const flags = writable<FeatureFlag[]>([]);
export const ready = writable(false);
export const error = writable<Error | null>(null);

const sdk = new GradualRolloutSDK({ apiKey: 'YOUR_API_KEY', anonId: crypto.randomUUID() });
sdk.on('initialized', () => ready.set(true));
sdk.on('flagsUpdated', f => flags.set(f));
sdk.on('error', e => error.set(e));
sdk.init();

export function isFeatureEnabled(key: string) {
  return sdk.isFeatureEnabled(key);
}

export function refreshFlags() {
  return sdk.refreshFlags();
}

export function setIdentity(userId?: string, anonId?: string) {
  sdk.setIdentity(userId, anonId);
}`}</code></pre>
					</section>
					<Separator className="my-8" />
					{/* Section: API */}
					<section id="api" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<Settings className="w-6 h-6 text-black" />
							API
						</h2>
						<ul className="list-disc ml-6 text-gray-700 mb-4">
							<li><b>Constructor:</b> <code>new GradualRolloutSDK(config)</code></li>
							<li><b>init()</b>: Initializes the SDK, fetches flags, and starts polling if enabled.</li>
							<li><b>isFeatureEnabled(flagKey: string)</b>: Returns true if the feature flag is enabled for the current user.</li>
							<li><b>refreshFlags()</b>: Manually fetches the latest flags from the backend.</li>
							<li><b>setIdentity(userId?: string, anonId?: string)</b>: Dynamically updates the user identity and refreshes flags accordingly.</li>
							<li><b>on(event, handler)</b>: Subscribes to events: <code>flagsUpdated</code>, <code>error</code>, <code>initialized</code>.</li>
							<li><b>off(event, handler)</b>: Unsubscribes a handler from an event.</li>
							<li><b>destroy()</b>: Cleans up timers and event listeners (stop polling).</li>
						</ul>
					</section>
					<Separator className="my-8" />
					{/* Section: Identity */}
					<section id="identity" className="scroll-mt-24">
						<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
							<Users className="w-6 h-6 text-black" />
							Dynamic User Identity Support
						</h2>
						<p className="mb-2 text-gray-700">Seamless A/B testing before and after login without losing rollout consistency. Anonymous user bucketing using <code>anonId</code>. Smooth transition to logged-in <code>userId</code> after authentication.</p>
					</section>
					<Separator className="my-8" />
					{/* Section: FAQ */}
					<section id="faq" className="scroll-mt-24">
						<div className="flex items-center gap-2 mb-6">
							<div className="flex justify-center items-center bg-gray-100 rounded-full w-10 h-10">
								<HelpCircle className="w-5 h-5 text-black" />
							</div>
							<h2 className="text-2xl font-bold">FAQs</h2>
						</div>
						
						<div className="mt-6 mb-8">
							<FaqSection
								items={[
									{
										question: "Can I lazy-load the SDK?",
										answer: (
											<p>
												<span className="font-medium">Yes</span> — inject your service only in lazy modules to defer initialization. This reduces the initial bundle size and improves app startup time.
											</p>
										),
									},
									{
										question: "How to switch user identity after login?",
										answer: (
											<p>
												Call <code>sdk.setIdentity(userId, anonId)</code> in your service and it automatically refreshes flags. This maintains consistent user experiences across login states.
											</p>
										),
									},
									{
										question: "Does polling impact performance?",
										answer: (
											<p>
												Default is 60s. You can disable polling by omitting <code>pollingIntervalMs</code>, or adjust the interval based on your app&apos;s needs. The SDK is optimized for minimal network overhead.
											</p>
										),
									},
									{
										question: "How to test different user roles?",
										answer: (
											<p>
												Use <code>setIdentity(&#39;user_id&#39;, &#39;anon_id&#39;)</code> with known IDs to simulate specific users. This makes testing various flag configurations and user segments easy during development.
											</p>
										),
									},
									{
										question: "Can I use with SvelteKit?",
										answer: (
											<p>
												<span className="font-medium">Yes</span> — just ensure the store is created in a module context (not in a component). This provides consistent flag state management throughout your Svelte application.
											</p>
										),
									},
								]}
							/>
						</div>
					</section>
				</div>
			</div>
			{/* Right side navigation */}
			<div className="hidden md:block absolute top-0 right-0 w-64 h-full border-l bg-gray-50 p-4">
				<div className="sticky top-4">
					<nav className="space-y-2">
						{sections.map(({ key, label, icon: Icon }) => (
							<a
								key={key}
								href={`#${key}`}
								onClick={() => handleSidebarClick(key)}
								className={`flex items-center gap-2 px-3 py-2 rounded-md transition font-medium text-sm ${
									activeSection === key
										? "bg-gray-200 text-black font-semibold"
										: "text-gray-800 hover:bg-gray-100 hover:text-black"
								}`}
							>
								<Icon className="w-4 h-4 text-black" />
								{label}
							</a>
						))}
					</nav>
				</div>
			</div>
		</div>
	);
}
