import React from "react";
import { Separator } from "@/components/ui/separator";
import { Rocket, BookOpen, Code, Zap, Layers, Users, Settings, HelpCircle } from "lucide-react";

const sections = [
	{ key: "overview", label: "Overview", icon: Rocket },
	{ key: "installation", label: "Installation", icon: Zap },
	{ key: "usage", label: "Usage", icon: Code },
	{ key: "react", label: "React", icon: BookOpen },
	{ key: "angular", label: "Angular", icon: Layers },
	{ key: "vue", label: "Vue 3", icon: Layers },
	{ key: "svelte", label: "Svelte", icon: Layers },
	{ key: "api", label: "API", icon: Settings },
	{ key: "identity", label: "Identity", icon: Users },
	{ key: "faq", label: "FAQ", icon: HelpCircle },
];

function SectionTitle({
	icon: Icon,
	children,
}: {
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<h2 className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4">
			<Icon className="w-6 h-6 text-blue-600" />
			{children}
		</h2>
	);
}

export default function DocumentationPage() {
	return (
		<div className="relative min-h-screen">
			{/* Main content */}
			<div className="p-6 pb-20">
				<div className="max-w-4xl mx-auto pr-0 md:pr-64">
					<section id="overview">
						<SectionTitle icon={Rocket}>GradualRollout SDK</SectionTitle>
						<p className="mb-4 text-lg text-gray-700">
							A lightweight, framework-agnostic JavaScript and TypeScript SDK for
							feature flagging and canary deployments. Enable safe, gradual feature
							rollouts with instant evaluation and real-time updates.
						</p>
						<ul className="list-disc ml-6 text-gray-700">
							<li>Connects seamlessly with your GradualRollout backend API</li>
							<li>Framework agnostic: use with React, Angular, Vue, or vanilla JS</li>
							<li>Consistent user bucketing via hashing for percentage rollouts</li>
							<li>
								Event-driven API with <code>flagsUpdated</code>, <code>error</code>,
								and <code>initialized</code> events
							</li>
							<li>
								Automatic polling with configurable interval and manual refresh
								support
							</li>
							<li>Simple to initialize and use with TypeScript support</li>
							<li>
								<b>Dynamic user identity support:</b> works with anonymous users (
								<code>anonId</code>) before login and updates seamlessly post-login (
								<code>userId</code>)
							</li>
						</ul>
					</section>
					<Separator className="my-8" />
					<section id="installation">
						<SectionTitle icon={Zap}>Installation</SectionTitle>
						<pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto mb-4">
							<code>npm install gradual-rollout-sdk</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="usage">
						<SectionTitle icon={Code}>Usage</SectionTitle>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4">
							<code>{`import { GradualRolloutSDK } from 'gradual-rollout-sdk';

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
sdk.destroy();`}</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="react">
						<SectionTitle icon={BookOpen}>React Integration</SectionTitle>
						<p className="mb-2 text-gray-700">
							Easy integration with React using context and hooks.
						</p>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4">
							<code>{`// GradualRolloutProvider.tsx
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
}`}</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="angular">
						<SectionTitle icon={Layers}>Angular Integration</SectionTitle>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4">
							<code>{`// rollout.service.ts
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
}`}</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="vue">
						<SectionTitle icon={Layers}>Vue 3 Integration</SectionTitle>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4">
							<code>{`// rollout.ts
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
};`}</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="svelte">
						<SectionTitle icon={Layers}>Svelte Integration</SectionTitle>
						<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mb-4">
							<code>{`// rollout.ts
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
}`}</code>
						</pre>
					</section>
					<Separator className="my-8" />
					<section id="api">
						<SectionTitle icon={Settings}>API</SectionTitle>
						<ul className="list-disc ml-6 text-gray-700 mb-4">
							<li>
								<b>Constructor:</b> <code>new GradualRolloutSDK(config)</code>
							</li>
							<li>
								<b>init()</b>: Initializes the SDK, fetches flags, and starts polling
								if enabled.
							</li>
							<li>
								<b>isFeatureEnabled(flagKey: string)</b>: Returns true if the feature
								flag is enabled for the current user.
							</li>
							<li>
								<b>refreshFlags()</b>: Manually fetches the latest flags from the
								backend.
							</li>
							<li>
								<b>setIdentity(userId?: string, anonId?: string)</b>: Dynamically
								updates the user identity and refreshes flags accordingly.
							</li>
							<li>
								<b>on(event, handler)</b>: Subscribes to events:{" "}
								<code>flagsUpdated</code>, <code>error</code>,{" "}
								<code>initialized</code>.
							</li>
							<li>
								<b>off(event, handler)</b>: Unsubscribes a handler from an event.
							</li>
							<li>
								<b>destroy()</b>: Cleans up timers and event listeners (stop polling).
							</li>
						</ul>
					</section>
					<Separator className="my-8" />
					<section id="identity">
						<SectionTitle icon={Users}>Dynamic User Identity Support</SectionTitle>
						<p className="mb-2 text-gray-700">
							Seamless A/B testing before and after login without losing rollout
							consistency. Anonymous user bucketing using <code>anonId</code>. Smooth
							transition to logged-in <code>userId</code> after authentication.
						</p>
					</section>
					<Separator className="my-8" />
					<section id="faq">
						<SectionTitle icon={HelpCircle}>FAQs</SectionTitle>
						<ul className="list-disc ml-6 text-gray-700 mb-4">
							<li>
								Can I lazy-load the SDK? <b>Yes</b>&mdash;inject your service only in
								lazy modules to defer initialization.
							</li>
							<li>
								How to switch user identity after login?{" "}
								<b>
									Call <code>sdk.setIdentity(userId, anonId)</code>
								</b>{" "}
								in your service and it auto-refreshes.
							</li>
							<li>
								Does polling impact performance?{" "}
								<b>
									Default is 60 s. You can disable by omitting{" "}
									<code>pollingIntervalMs</code>.
								</b>
							</li>
							<li>
								How to test different user roles?{" "}
								<b>
									Use <code>setIdentity(&lsquo;user_id&lsquo;, &lsquo;anon_id&lsquo;)</code> with known IDs.
								</b>
							</li>
							<li>
								Can I use with SvelteKit?{" "}
								<b>
									Yes, just ensure the store is created in a module context (not in
									a component).
								</b>
							</li>
						</ul>
					</section>
				</div>
			</div>

			{/* Right side navigation */}
			<div className="hidden md:block fixed top-0 right-0 w-64 h-full border-l bg-gray-50 p-4">
				<div className="sticky top-4">
					<h3 className="font-bold mb-4 text-gray-900">Documentation</h3>
					<nav className="space-y-2">
						{sections.map(({ key, label, icon: Icon }) => (
							<a
								key={key}
								href={`#${key}`}
								className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition font-medium text-sm"
							>
								<Icon className="w-4 h-4" />
								{label}
							</a>
						))}
					</nav>
				</div>
			</div>
		</div>
	);
}
