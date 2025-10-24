import {
    Application,
    Assets,
    BlurFilter,
    Container,
    Graphics,
    Sprite,
    Text,
    TextStyle,
    Texture,
} from 'pixi.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface ApiAsset {
    id: number;
    title: string;
    imageUrl: string;
}

export interface ApiRewardAsset {
    id: number;
    count: number;
}

export interface ApiReward {
    id: number;
    title: string;
    bonusCode: string;
    type: string;
    probability: number;
    assets: ApiRewardAsset[];
}

export interface ApiResponse {
    id: number;
    rows: number;
    columns: number;
    title: string;
    logoImage: string;
    backgroundImage: string;
    assets: ApiAsset[];
    rewards: ApiReward[];
}

export interface GameConfig {
    layout: {
        topBarHeight: number;
        bottomBarHeight: number;
    };
    grid: {
        rows: number;
        columns: number;
        reelWidth: number;
        symbolSize: number;
    };
    gameplay: {
        initialSpins: number;
        spinTime: number;
        baseSpinRotations: number;
        reelStaggerTime: number;
        blurIntensity: number;
        backoutAmount: number;
    };
    fonts: {
        primary: {
            family: string;
            weights: string[];
        };
        header: {
            family: string;
            size: number;
            weight: string;
            color: number;
            dropShadow: {
                color: number;
                angle: number;
                blur: number;
                distance: number;
            };
        };
        spinCounter: {
            family: string;
            size: number;
            weight: string;
            color: number;
            stroke: { color: number; width: number };
            dropShadow: {
                color: number;
                angle: number;
                blur: number;
                distance: number;
            };
        };
    };
    text: {
        topBarHeader: string;
        spinButton: string;
        spinCounter: (spins: number) => string;
        noSpinsAlert: string;
    };
    modals: any;
    buttons: any;
    particles: any;
    gradient: any;
    winAnimation: any;
    symbols?: Record<string, any>;
    prizeTypes?: any;
}

interface Reel {
    container: Container;
    symbols: any[];
    symbolKeys: string[];
    position: number;
    previousPosition: number;
    blur: BlurFilter;
}

interface WinOutcome {
    symbolKey: string;
    positions: number[];
    reward: ApiReward;
}

interface EventCallbacks {
    onSpinStart?: () => void;
    onSpinComplete?: (result: { won: boolean; reward?: ApiReward }) => void;
    onSpinsUpdate?: (remaining: number) => void;
    onWin?: (reward: ApiReward) => void;
}

// ============================================================================
// DEFAULT GAME CONFIGURATION
// ============================================================================
const DEFAULT_GAME_CONFIG: GameConfig = {
    layout: {
        topBarHeight: 80,   // Reduced from 100 - more space for reels
        bottomBarHeight: 90, // Reduced from 120 - more space for reels
    },
    grid: {
        rows: 4,
        columns: 5,
        reelWidth: 160,
        symbolSize: 150,
    },
    gameplay: {
        initialSpins: 15,
        spinTime: 1500,
        baseSpinRotations: 45,
        reelStaggerTime: 500,
        blurIntensity: 20,
        backoutAmount: 0.5,
    },
    fonts: {
        primary: {
            family: 'Chakra Petch',
            weights: ['400', '700'],
        },
        header: {
            family: 'Chakra Petch',
            size: 36,
            weight: 'bold',
            color: 0xffffff,
            dropShadow: {
                color: 0x000000,
                angle: Math.PI / 6,
                blur: 4,
                distance: 6,
            },
        },
        spinCounter: {
            family: 'Chakra Petch',
            size: 32,
            weight: 'bold',
            color: 0xffffff,
            stroke: { color: 0x4a1850, width: 4 },
            dropShadow: {
                color: 0x000000,
                angle: Math.PI / 6,
                blur: 4,
                distance: 6,
            },
        },
    },
    text: {
        topBarHeader: 'EngageFactory Slots',
        spinButton: 'SPIN TO WIN!',
        spinCounter: (spins) => `Spins: ${spins}`,
        noSpinsAlert: 'No spins remaining!',
    },
    modals: {
        win: {
            title: 'YOU WIN!',
            width: 500,
            height: 350,
            borderRadius: 20,
            borderWidth: 4,
            borderColor: 0xffd700,
            backgroundColor: 0x1a1a2e,
            overlayAlpha: 0.7,
            titleStyle: {
                family: 'Chakra Petch',
                size: 48,
                weight: 'bold',
                color: 0xffd700,
            },
            prizeStyle: {
                family: 'Chakra Petch',
                size: 28,
                color: 0xffffff,
            },
            buttons: {
                bonus: {
                    label: 'REDEEM',
                    loadingLabel: 'REDEEMING...',
                    successMessage: 'Bonus Redeemed!\nCheck your account',
                    closeLabel: 'CLOSE',
                },
                iphone: {
                    label: 'CLAIM',
                },
                extraSpins: {
                    label: 'COLLECT',
                },
                width: 200,
                height: 50,
                color: 0x4caf50,
                textStyle: {
                    family: 'Chakra Petch',
                    size: 24,
                    weight: 'bold',
                    color: 0xffffff,
                },
            },
        },
        prizes: {
            title: 'PRIZES & COMBOS',
            width: 600,
            height: 550,
            borderRadius: 20,
            borderWidth: 4,
            borderColor: 0x8b3fbf,
            backgroundColor: 0x1a1a2e,
            overlayAlpha: 0.7,
            titleStyle: {
                family: 'Chakra Petch',
                size: 32,
                weight: 'bold',
                color: 0x8b3fbf,
            },
            sectionHeaders: {
                special: '🎁 SPECIAL PRIZES',
                spins: '🎰 EXTRA SPINS',
                style: {
                    size: 22,
                    weight: 'bold',
                },
            },
            itemStyle: {
                family: 'Chakra Petch',
                size: 20,
                color: 0xffffff,
            },
            descStyle: {
                family: 'Chakra Petch',
                size: 16,
                color: 0xaaaaaa,
            },
            matchDescription: 'Match 5 identical symbols',
            closeButton: {
                label: 'CLOSE',
                width: 150,
                height: 50,
                color: 0x8b3fbf,
            },
        },
    },
    buttons: {
        spin: {
            width: 250,
            height: 70,
            borderRadius: 15,
            pressOffset: 2,
            colors: {
                top: 0x8b3fbf,
                bottom: 0x6a1b9a,
                pressed: 0x5a1e7a,
                highlight: 0xa855f7,
                glow: 0xe040fb,
                shadow: 0x2a0a3a,
            },
            textStyle: {
                family: 'Chakra Petch',
                size: 32,
                weight: 'bold',
                color: 0xffffff,
                stroke: { color: 0x4a148c, width: 3 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 2,
                    blur: 3,
                    distance: 3,
                },
            },
        },
        info: {
            size: 60,
            color: 0x8b3fbf,
            borderColor: 0xa855f7,
            borderWidth: 2,
            textStyle: {
                family: 'Chakra Petch',
                size: 36,
                weight: 'bold',
                color: 0xffffff,
            },
            label: 'i',
        },
    },
    particles: {
        background: {
            count: 100,
            speedX: 1.5,
            speedY: 1.0,
            minSize: 1.5,
            maxSize: 4.5,
            baseAlphaMin: 0.2,
            baseAlphaMax: 0.6,
            pulseSpeedMin: 0.02,
            pulseSpeedMax: 0.07,
            color: 0x8b3fbf,
        },
        win: {
            burstCount: 50,
            emitCount: 7,
            emitDuration: 40,
            emitInterval: 50,
            colors: [0xffd700, 0xffa500, 0xffff00, 0xff6347],
        },
    },
    gradient: {
        enabled: false,   // Disabled by default - cleaner look
        height: 20,       
        intensity: 0.25,  
    },
    winAnimation: {
        flashCount: 10,
        flashInterval: 150,
        highlightColor: 0xffd700,
        highlightWidth: 6,
    },
};

// ============================================================================
// SLOTS ENGINE CLASS
// ============================================================================
export class SlotsEngine {
    private app: Application;
    private config: GameConfig;
    private apiData: ApiResponse | null = null;
    
    // Game state
    private remainingSpins: number;
    private running: boolean = false;
    private modalOpen: boolean = false;
    private currentWinOutcome: WinOutcome | null = null;
    
    // UI elements
    private reels: Reel[] = [];
    private reelContainer!: Container;
    private topBar!: Container;
    private bottomBar!: Container;
    private logo!: Sprite;
    private headerText!: Text;
    private spinCounterText!: Text;
    private spinButton!: Container;
    private infoButton!: Container;
    
    // Textures and assets
    private slotTextures: Record<string, Texture> = {};
    private symbolsArray: string[] = [];
    
    // Particles
    private particles: any[] = [];
    
    // Tweening
    private tweening: any[] = [];
    
    // Event callbacks
    private callbacks: EventCallbacks = {};

    constructor(canvas: HTMLCanvasElement, config?: Partial<GameConfig>) {
        this.config = this.mergeConfig(config);
        this.remainingSpins = this.config.gameplay.initialSpins;
        this.app = new Application();
        this.initializeApp(canvas);
    }

    // ========================================================================
    // CONFIGURATION & INITIALIZATION
    // ========================================================================
    
    private mergeConfig(partial?: Partial<GameConfig>): GameConfig {
        if (!partial) return { ...DEFAULT_GAME_CONFIG };
        
        return {
            ...DEFAULT_GAME_CONFIG,
            ...partial,
            layout: { ...DEFAULT_GAME_CONFIG.layout, ...(partial.layout || {}) },
            grid: { ...DEFAULT_GAME_CONFIG.grid, ...(partial.grid || {}) },
            gameplay: { ...DEFAULT_GAME_CONFIG.gameplay, ...(partial.gameplay || {}) },
            fonts: { ...DEFAULT_GAME_CONFIG.fonts, ...(partial.fonts || {}) },
            text: { ...DEFAULT_GAME_CONFIG.text, ...(partial.text || {}) },
            modals: { ...DEFAULT_GAME_CONFIG.modals, ...(partial.modals || {}) },
            buttons: { ...DEFAULT_GAME_CONFIG.buttons, ...(partial.buttons || {}) },
            particles: { ...DEFAULT_GAME_CONFIG.particles, ...(partial.particles || {}) },
            gradient: { ...DEFAULT_GAME_CONFIG.gradient, ...(partial.gradient || {}) },
            winAnimation: { ...DEFAULT_GAME_CONFIG.winAnimation, ...(partial.winAnimation || {}) },
        };
    }

    private async initializeApp(canvas: HTMLCanvasElement): Promise<void> {
        await this.app.init({
            canvas,
            backgroundColor: 0x1a1a2e,
            resizeTo: window,
        });

        await this.loadFonts();
        this.setupTickerCallbacks();
    }

    public async fetchGameConfig(apiEndpoint: string, headers?: Record<string, string>): Promise<void> {
        console.log('🌐 Fetching game config from:', apiEndpoint);
        
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch game config: ${response.status}`);
        }

        this.apiData = await response.json();
        console.log('✅ API data received:', {
            rows: this.apiData.rows,
            columns: this.apiData.columns,
            title: this.apiData.title,
            assetsCount: this.apiData.assets.length,
            rewardsCount: this.apiData.rewards.length
        });
        
        // Update config from API
        this.config.grid.rows = this.apiData.rows;
        this.config.grid.columns = this.apiData.columns;
        this.config.text.topBarHeader = this.apiData.title;

        // Process rewards and build symbols config
        this.processApiData();
        console.log('✅ Processed API data, symbols config created');
        
        // Load assets and create scene
        await this.loadAssets();
        await this.createGameScene();
    }

    private processApiData(): void {
        if (!this.apiData) return;

        const symbolsConfig: Record<string, any> = {};
        const prizeTypes = {
            BONUS: 'bonus',
            IPHONE: 'iphone',
            EXTRA_SPINS: 'extraSpins',
        };

        this.apiData.rewards.forEach((reward) => {
            reward.assets.forEach((asset) => {
                const apiAsset = this.apiData!.assets.find((a) => a.id === asset.id);
                if (!apiAsset) return;

                const symbolKey = `symbol_${asset.id}`;
                
                if (reward.type === 'bonus') {
                    symbolsConfig[symbolKey] = {
                        type: prizeTypes.BONUS,
                        reward: reward,
                        weight: reward.probability,
                    };
                } else if (reward.type === 'iphone') {
                    symbolsConfig[symbolKey] = {
                        type: prizeTypes.IPHONE,
                        reward: reward,
                        weight: reward.probability,
                    };
                } else if (reward.type === 'extraSpins') {
                    symbolsConfig[symbolKey] = {
                        type: prizeTypes.EXTRA_SPINS,
                        spins: asset.count,
                        reward: reward,
                        weight: reward.probability,
                    };
                }
            });
        });

        this.config.symbols = symbolsConfig;
        this.config.prizeTypes = prizeTypes;
    }

    private async loadFonts(): Promise<void> {
        // Method 1: Inject Google Fonts via CSS link (most reliable)
        if (!document.querySelector('link[href*="fonts.googleapis.com/css2"][href*="Chakra+Petch"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;700&display=swap';
            document.head.appendChild(link);
            
            // Wait for fonts to load
            await document.fonts.ready;
        }

        // Method 2: Fallback to FontFace API if needed
        try {
            if (!document.fonts.check('12px "Chakra Petch"')) {
                const font = new FontFace(
                    'Chakra Petch',
                    'url(https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MaFLtkE3UjaJxCmrYGkHgIs.woff2) format("woff2")',
                    { weight: '400', style: 'normal' }
                );
                await font.load();
                document.fonts.add(font);

                const fontBold = new FontFace(
                    'Chakra Petch',
                    'url(https://fonts.gstatic.com/s/chakrapetch/v11/cIf9MaFLtkE3UjaJxCmrYGkHiY71EHxc.woff2) format("woff2")',
                    { weight: '700', style: 'normal' }
                );
                await fontBold.load();
                document.fonts.add(fontBold);
            }
        } catch (error) {
            console.warn('FontFace API failed, using CSS loaded fonts:', error);
        }
    }

    private async loadAssets(): Promise<void> {
        if (!this.apiData) {
            console.warn('⚠️ No API data available for asset loading');
            return;
        }

        console.log('📦 Loading assets...', this.apiData.assets.length, 'assets');

        const startTime = performance.now();

        try {
            // Create asset bundle for better batching
            const assetBundle: { alias: string; src: string }[] = [];

            // Add asset images
            for (const asset of this.apiData.assets) {
                assetBundle.push({
                    alias: `symbol_${asset.id}`,
                    src: asset.imageUrl
                });
            }

            // Add logo and background if available
            if (this.apiData.logoImage) {
                assetBundle.push({ alias: 'logo', src: this.apiData.logoImage });
            }
            if (this.apiData.backgroundImage) {
                assetBundle.push({ alias: 'background', src: this.apiData.backgroundImage });
            }

            console.log(`⏳ Loading ${assetBundle.length} assets in parallel...`);

            // Add bundle to Assets
            Assets.addBundle('gameAssets', assetBundle);

            // Load entire bundle at once - PixiJS handles optimal batching
            await Assets.loadBundle('gameAssets', (progress) => {
                if (progress % 0.2 < 0.01) { // Log every 20%
                    console.log(`  Progress: ${Math.round(progress * 100)}%`);
                }
            });

            const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Assets loaded in ${loadTime}s`);
        } catch (error) {
            console.error('❌ Failed to load assets:', error);
            throw error;
        }

        // Build textures map
        let successCount = 0;
        for (const asset of this.apiData.assets) {
            const key = `symbol_${asset.id}`;
            try {
                const texture = Assets.get(key);
                if (texture) {
                    this.slotTextures[key] = texture;
                    successCount++;
                } else {
                    console.warn(`⚠️ Could not get texture for: ${key}`);
                }
            } catch (error) {
                console.error(`❌ Failed to get texture for: ${key}`, error);
            }
        }

        this.symbolsArray = Object.keys(this.slotTextures);
        console.log(`✅ Built textures map: ${successCount}/${this.apiData.assets.length} symbols loaded`);
        
        if (this.symbolsArray.length === 0) {
            throw new Error('No textures loaded! All assets failed.');
        }
    }

    // ========================================================================
    // SCENE CREATION
    // ========================================================================

    private async createGameScene(): Promise<void> {
        console.log('🎮 Creating game scene...');
        console.log('Symbols available:', this.symbolsArray.length);
        console.log('Symbol keys:', this.symbolsArray);
        console.log('Screen size:', this.app.screen.width, 'x', this.app.screen.height);
        
        if (this.symbolsArray.length === 0) {
            throw new Error('No symbols loaded! Cannot create reels.');
        }
        
        // Enable sorting by zIndex
        this.app.stage.sortableChildren = true;
        
        this.calculateGridDimensions();
        console.log('Grid dimensions:', this.config.grid);
        
        // Calculate and log heights
        const topBarHeight = this.config.layout.topBarHeight;
        const bottomBarHeight = this.config.layout.bottomBarHeight;
        const reelHeight = this.config.grid.rows * this.config.grid.symbolSize;
        const totalHeight = topBarHeight + reelHeight + bottomBarHeight;
        
        console.log('📏 HEIGHT BREAKDOWN:');
        console.log('  Screen height:', this.app.screen.height);
        console.log('  Top bar:', topBarHeight);
        console.log('  Reels:', reelHeight, `(${this.config.grid.rows} rows × ${this.config.grid.symbolSize}px)`);
        console.log('  Bottom bar:', bottomBarHeight);
        console.log('  TOTAL:', totalHeight);
        console.log('  Difference:', this.app.screen.height - totalHeight);
        
        this.createBackgroundParticles();
        console.log('✅ Background particles created');
        
        this.createTopBar();
        console.log('✅ Top bar created');
        
        this.createReels();
        console.log('✅ Reels created');
        
        this.createGradientOverlay();
        console.log('✅ Gradient overlay created');
        
        this.createBottomBar();
        console.log('✅ Bottom bar created');
        
        // Sort all children by zIndex
        this.app.stage.sortChildren();
        
        console.log('🎮 Game scene complete!');
        console.log('Stage children count:', this.app.stage.children.length);
    }
    
    private createDebugHeightOverlay(): void {
        const debugContainer = new Container();
        debugContainer.zIndex = 10000; // On top of everything
        
        const topBarHeight = this.config.layout.topBarHeight;
        const bottomBarHeight = this.config.layout.bottomBarHeight;
        const reelHeight = this.config.grid.rows * this.config.grid.symbolSize;
        const totalHeight = topBarHeight + reelHeight + bottomBarHeight;
        
        const debugStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0x00ff00,
            backgroundColor: 0x000000,
            padding: 5
        });
        
        // Top bar height
        const topText = new Text(`Top Bar: ${topBarHeight}px`, debugStyle);
        topText.x = 10;
        topText.y = topBarHeight / 2 - 10;
        debugContainer.addChild(topText);
        
        // Reel height
        const reelText = new Text(`Reels: ${reelHeight}px (${this.config.grid.rows}×${this.config.grid.symbolSize})`, debugStyle);
        reelText.x = 10;
        reelText.y = topBarHeight + reelHeight / 2 - 10;
        debugContainer.addChild(reelText);
        
        // Bottom bar height
        const bottomText = new Text(`Bottom Bar: ${bottomBarHeight}px`, debugStyle);
        bottomText.x = 10;
        bottomText.y = topBarHeight + reelHeight + bottomBarHeight / 2 - 10;
        debugContainer.addChild(bottomText);
        
        // Total
        const totalStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffff00,
            backgroundColor: 0x000000,
            padding: 5
        });
        const diff = this.app.screen.height - totalHeight;
        const totalText = new Text(`TOTAL: ${totalHeight}px / Screen: ${this.app.screen.height}px (${diff > 0 ? '+' : ''}${diff}px)`, totalStyle);
        totalText.x = 10;
        totalText.y = 10;
        debugContainer.addChild(totalText);
        
        this.app.stage.addChild(debugContainer);
        console.log('✅ Debug overlay added to stage');
    }

    private calculateGridDimensions(): void {
        const availableHeight =
            this.app.screen.height -
            this.config.layout.topBarHeight -
            this.config.layout.bottomBarHeight;

        this.config.grid.symbolSize = Math.floor(availableHeight / this.config.grid.rows);
        this.config.grid.reelWidth = this.config.grid.symbolSize;
    }

    private createBackgroundParticles(): void {
        const particleConfig = this.config.particles.background;

        for (let i = 0; i < particleConfig.count; i++) {
            const particle = new Graphics().circle(0, 0, Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize).fill({ color: particleConfig.color });

            particle.x = Math.random() * this.app.screen.width;
            particle.y = Math.random() * this.app.screen.height;

            const baseAlpha = Math.random() * (particleConfig.baseAlphaMax - particleConfig.baseAlphaMin) + particleConfig.baseAlphaMin;
            particle.alpha = baseAlpha;

            (particle as any).vx = (Math.random() - 0.5) * particleConfig.speedX;
            (particle as any).vy = Math.random() * particleConfig.speedY;
            (particle as any).baseAlpha = baseAlpha;
            (particle as any).pulseSpeed = Math.random() * (particleConfig.pulseSpeedMax - particleConfig.pulseSpeedMin) + particleConfig.pulseSpeedMin;
            (particle as any).pulsePhase = Math.random() * Math.PI * 2;

            this.particles.push(particle);
            this.app.stage.addChild(particle);
        }

        this.app.ticker.add(() => {
            const particleConfig = this.config.particles.background;
            for (const particle of this.particles) {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < -10) particle.x = this.app.screen.width + 10;
                if (particle.x > this.app.screen.width + 10) particle.x = -10;
                if (particle.y > this.app.screen.height + 10) {
                    particle.y = -10;
                    particle.x = Math.random() * this.app.screen.width;
                }

                particle.pulsePhase += particle.pulseSpeed;
                particle.alpha = particle.baseAlpha + Math.sin(particle.pulsePhase) * 0.2;
            }
        });
    }

    private createTopBar(): void {
        this.topBar = new Container();
        this.topBar.y = 0;

        const topBarBg = new Graphics()
            .rect(0, 0, this.app.screen.width, this.config.layout.topBarHeight)
            .fill({ color: 0x1a0a2e, alpha: 0.8 });
        this.topBar.addChild(topBarBg);

        // Logo
        if (this.apiData?.logoImage) {
            this.logo = new Sprite(Assets.get('logo'));
            const logoMaxHeight = this.config.layout.topBarHeight * 0.7;
            const logoScale = Math.min(logoMaxHeight / this.logo.height, 150 / this.logo.width);
            this.logo.scale.set(logoScale);
            this.logo.x = 20;
            this.logo.y = (this.config.layout.topBarHeight - this.logo.height * logoScale) / 2;
            this.topBar.addChild(this.logo);
        }

        // Header text
        const headerStyle = new TextStyle({
            fontFamily: this.config.fonts.header.family,
            fontSize: this.config.fonts.header.size,
            fontWeight: this.config.fonts.header.weight,
            fill: this.config.fonts.header.color,
            dropShadow: this.config.fonts.header.dropShadow,
        });

        this.headerText = new Text({ text: this.config.text.topBarHeader, style: headerStyle });
        this.headerText.anchor.set(0.5);
        this.headerText.x = this.app.screen.width / 2;
        this.headerText.y = this.config.layout.topBarHeight / 2;
        this.topBar.addChild(this.headerText);

        // Spin counter
        const spinCounterStyle = new TextStyle({
            fontFamily: this.config.fonts.spinCounter.family,
            fontSize: this.config.fonts.spinCounter.size,
            fontWeight: this.config.fonts.spinCounter.weight,
            fill: this.config.fonts.spinCounter.color,
            stroke: this.config.fonts.spinCounter.stroke,
            dropShadow: this.config.fonts.spinCounter.dropShadow,
        });

        this.spinCounterText = new Text({
            text: this.config.text.spinCounter(this.remainingSpins),
            style: spinCounterStyle,
        });
        this.spinCounterText.anchor.set(1, 0.5);
        this.spinCounterText.x = this.app.screen.width - 20;
        this.spinCounterText.y = this.config.layout.topBarHeight / 2;
        this.topBar.addChild(this.spinCounterText);

        this.topBar.zIndex = 1000;
        this.app.stage.addChild(this.topBar);
    }

    private createReels(): void {
        this.reelContainer = new Container();

        const totalReelWidth = this.config.grid.columns * this.config.grid.reelWidth;
        const startX = (this.app.screen.width - totalReelWidth) / 2;
        const startY = this.config.layout.topBarHeight;

        const reelMargin = 5;
        const rc = new Container();

        for (let i = 0; i < this.config.grid.columns; i++) {
            const reelColumn = new Container();
            reelColumn.x = i * this.config.grid.reelWidth;

            const columnMask = new Graphics()
                .rect(0, 0, this.config.grid.reelWidth, this.config.grid.rows * this.config.grid.symbolSize)
                .fill({ color: 0xffffff });
            reelColumn.addChild(columnMask);

            const symbols: any[] = [];
            const symbolKeys: string[] = [];

            for (let j = 0; j < this.config.grid.rows + 1; j++) {
                const symbolKey = this.symbolsArray[Math.floor(Math.random() * this.symbolsArray.length)];
                symbolKeys.push(symbolKey);

                const symbol = new Sprite(this.slotTextures[symbolKey]);
                (symbol as any).symbolKey = symbolKey;

                const scale = Math.min(
                    this.config.grid.symbolSize / symbol.texture.width,
                    this.config.grid.symbolSize / symbol.texture.height
                );
                symbol.scale.x = symbol.scale.y = scale;
                symbol.x = Math.round((this.config.grid.symbolSize - symbol.texture.width * scale) / 2);

                const symbolHeight = symbol.texture.height * scale;
                const baseY = (j - 1) * this.config.grid.symbolSize;
                symbol.y = baseY + Math.round((this.config.grid.symbolSize - symbolHeight) / 2);
                (symbol as any).baseY = baseY;

                reelColumn.addChild(symbol);
                symbols.push(symbol);
            }

            reelColumn.mask = columnMask;

            const blur = new BlurFilter();
            blur.blurX = 0;
            blur.blurY = 0;
            reelColumn.filters = [blur];

            rc.addChild(reelColumn);

            this.reels.push({
                container: reelColumn,
                symbols,
                symbolKeys,
                position: 0,
                previousPosition: 0,
                blur,
            });
        }

        rc.x = startX;
        rc.y = startY;

        const reelsBorder = new Graphics()
            .rect(
                startX - reelMargin,
                startY - reelMargin,
                totalReelWidth + reelMargin * 2,
                this.config.grid.rows * this.config.grid.symbolSize + reelMargin * 2
            )
            .stroke({ width: 3, color: 0x8b3fbf });
        this.app.stage.addChild(reelsBorder);

        this.reelContainer.addChild(rc);
        this.reelContainer.zIndex = 1;
        this.app.stage.addChild(this.reelContainer);
    }

    private createGradientOverlay(): void {
        // Check if gradients are enabled
        if (!this.config.gradient.enabled) {
            console.log('Gradients disabled');
            return;
        }

        const startY = this.config.layout.topBarHeight;
        const reelHeight = this.config.grid.rows * this.config.grid.symbolSize;
        const totalReelWidth = this.config.grid.columns * this.config.grid.reelWidth;
        const startX = (this.app.screen.width - totalReelWidth) / 2;
        
        const gradientHeight = Math.min(this.config.gradient.height, reelHeight / 4); // Max 1/4 of reel height

        // Top gradient - positioned INSIDE the reel area, not at the bar edge
        // Start a few pixels down from the top bar to avoid bleeding
        const topGradient = this.createGradient(
            startX, 
            startY + 5,  // Offset down by 5px from top bar
            totalReelWidth, 
            gradientHeight, 
            true
        );
        topGradient.zIndex = 500;
        this.app.stage.addChild(topGradient);

        // Bottom gradient - positioned INSIDE the reel area, not at the bar edge
        // End a few pixels up from the bottom bar to avoid bleeding
        const bottomGradient = this.createGradient(
            startX,
            startY + reelHeight - gradientHeight - 5,  // Offset up by 5px from bottom bar
            totalReelWidth,
            gradientHeight,
            false
        );
        bottomGradient.zIndex = 500;
        this.app.stage.addChild(bottomGradient);
        
        console.log('✅ Gradients created:', {
            height: gradientHeight,
            intensity: this.config.gradient.intensity,
            topY: startY + 5,
            bottomY: startY + reelHeight - gradientHeight - 5,
            reelAreaStart: startY,
            reelAreaEnd: startY + reelHeight
        });
    }

    private createGradient(x: number, y: number, width: number, height: number, topToBottom: boolean): Graphics {
        const gradient = new Graphics();
        const steps = 30; // More steps for smoother gradient
        const stepHeight = height / steps;

        for (let i = 0; i < steps; i++) {
            let alpha: number;

            if (topToBottom) {
                // Top gradient: opaque black at top → transparent at bottom
                alpha = 1.0 - (i / steps);
            } else {
                // Bottom gradient: transparent at top → opaque black at bottom
                alpha = i / steps;
            }

            // Use configurable intensity
            gradient.rect(x, y + i * stepHeight, width, stepHeight).fill({ 
                color: 0x000000, 
                alpha: alpha * this.config.gradient.intensity 
            });
        }

        return gradient;
    }

    private createBottomBar(): void {
        this.bottomBar = new Container();
        const bottomY = this.config.layout.topBarHeight + this.config.grid.rows * this.config.grid.symbolSize;
        this.bottomBar.y = bottomY;

        const bottomBarBg = new Graphics()
            .rect(0, 0, this.app.screen.width, this.config.layout.bottomBarHeight)
            .fill({ color: 0x1a0a2e, alpha: 0.8 });
        this.bottomBar.addChild(bottomBarBg);

        this.createSpinButton();
        this.createInfoButton();

        this.bottomBar.zIndex = 1000;
        this.app.stage.addChild(this.bottomBar);
    }

    private createSpinButton(): void {
        const buttonConfig = this.config.buttons.spin;
        this.spinButton = new Container();
        this.spinButton.eventMode = 'static';
        this.spinButton.cursor = 'pointer';

        const button3D = new Graphics();

        // Shadow
        button3D
            .roundRect(3, 3, buttonConfig.width, buttonConfig.height, buttonConfig.borderRadius)
            .fill({ color: buttonConfig.colors.shadow });

        // Main gradient body
        const gradientBody = new Graphics();
        for (let i = 0; i < buttonConfig.height; i++) {
            const ratio = i / buttonConfig.height;
            const color = this.interpolateColor(buttonConfig.colors.top, buttonConfig.colors.bottom, ratio);
            gradientBody.rect(0, i, buttonConfig.width, 1).fill({ color });
        }
        
        // Create rounded mask for the gradient
        const gradientMask = new Graphics()
            .roundRect(0, 0, buttonConfig.width, buttonConfig.height, buttonConfig.borderRadius)
            .fill({ color: 0xffffff });
        
        gradientBody.mask = gradientMask;
        button3D.addChild(gradientMask); // Add mask to display tree
        button3D.addChild(gradientBody);

        // Top highlight
        button3D
            .roundRect(0, 0, buttonConfig.width, buttonConfig.height / 3, buttonConfig.borderRadius)
            .fill({ color: buttonConfig.colors.highlight, alpha: 0.3 });

        // Glow effect
        button3D
            .roundRect(-2, -2, buttonConfig.width + 4, buttonConfig.height + 4, buttonConfig.borderRadius + 2)
            .stroke({ width: 2, color: buttonConfig.colors.glow, alpha: 0.6 });

        const buttonTextStyle = new TextStyle({
            fontFamily: buttonConfig.textStyle.family,
            fontSize: buttonConfig.textStyle.size,
            fontWeight: buttonConfig.textStyle.weight,
            fill: buttonConfig.textStyle.color,
            stroke: buttonConfig.textStyle.stroke,
            dropShadow: buttonConfig.textStyle.dropShadow,
        });

        const buttonText = new Text({ text: this.config.text.spinButton, style: buttonTextStyle });
        buttonText.anchor.set(0.5);
        buttonText.x = buttonConfig.width / 2;
        buttonText.y = buttonConfig.height / 2;

        this.spinButton.addChild(button3D);
        this.spinButton.addChild(buttonText);

        this.spinButton.x = (this.app.screen.width - buttonConfig.width) / 2;
        this.spinButton.y = (this.config.layout.bottomBarHeight - buttonConfig.height) / 2;

        this.spinButton.on('pointerdown', () => {
            this.spinButton.y += buttonConfig.pressOffset;
        });

        this.spinButton.on('pointerup', () => {
            this.spinButton.y -= buttonConfig.pressOffset;
            this.startPlay();
        });

        this.spinButton.on('pointerupoutside', () => {
            this.spinButton.y -= buttonConfig.pressOffset;
        });

        this.bottomBar.addChild(this.spinButton);
    }

    private createInfoButton(): void {
        const buttonConfig = this.config.buttons.info;
        this.infoButton = new Container();
        this.infoButton.eventMode = 'static';
        this.infoButton.cursor = 'pointer';

        const circle = new Graphics().circle(0, 0, buttonConfig.size / 2).fill({ color: buttonConfig.color });

        const border = new Graphics()
            .circle(0, 0, buttonConfig.size / 2)
            .stroke({ width: buttonConfig.borderWidth, color: buttonConfig.borderColor });

        const infoTextStyle = new TextStyle({
            fontFamily: buttonConfig.textStyle.family,
            fontSize: buttonConfig.textStyle.size,
            fontWeight: buttonConfig.textStyle.weight,
            fill: buttonConfig.textStyle.color,
        });

        const infoText = new Text({ text: buttonConfig.label, style: infoTextStyle });
        infoText.anchor.set(0.5);

        this.infoButton.addChild(circle);
        this.infoButton.addChild(border);
        this.infoButton.addChild(infoText);

        this.infoButton.x = this.app.screen.width - buttonConfig.size - 20;
        this.infoButton.y = this.config.layout.bottomBarHeight / 2;

        this.infoButton.on('pointerdown', () => this.showPrizesModal());

        this.bottomBar.addChild(this.infoButton);
    }

    // ========================================================================
    // GAME LOGIC
    // ========================================================================

    private determineWinOutcome(): WinOutcome | null {
        if (!this.config.symbols) return null;

        const totalWeight = Object.values(this.config.symbols).reduce((sum: number, s: any) => sum + s.weight, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;

        for (const [key, symbolConfig] of Object.entries(this.config.symbols)) {
            cumulative += (symbolConfig as any).weight;
            if (rand < cumulative) {
                const positions: number[] = [];
                for (let i = 0; i < this.config.grid.columns; i++) {
                    positions.push(Math.floor(Math.random() * this.config.grid.rows));
                }
                return {
                    symbolKey: key,
                    positions,
                    reward: (symbolConfig as any).reward,
                };
            }
        }

        return null;
    }

    private buildReelsForOutcome(outcome: WinOutcome | null): string[][] {
        const reelSymbols: string[][] = [];

        for (let col = 0; col < this.config.grid.columns; col++) {
            const columnSymbols: string[] = [];

            for (let row = 0; row < this.config.grid.rows + 1; row++) {
                if (outcome && row === outcome.positions[col] + 1) {
                    columnSymbols.push(outcome.symbolKey);
                } else {
                    let randomSymbol: string;
                    do {
                        randomSymbol = this.symbolsArray[Math.floor(Math.random() * this.symbolsArray.length)];
                    } while (outcome && randomSymbol === outcome.symbolKey);
                    columnSymbols.push(randomSymbol);
                }
            }

            reelSymbols.push(columnSymbols);
        }

        return reelSymbols;
    }

    private rebuildReels(reelSymbols: string[][]): void {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].symbolKeys = reelSymbols[i];
        }
    }

    public async startPlay(): Promise<void> {
        if (this.running || this.modalOpen) {
            return;
        }
        if (this.remainingSpins <= 0) {
            alert(this.config.text.noSpinsAlert);
            return;
        }

        this.running = true;
        this.remainingSpins--;
        this.updateSpinCounter();

        if (this.callbacks.onSpinStart) {
            this.callbacks.onSpinStart();
        }

        if (this.callbacks.onSpinsUpdate) {
            this.callbacks.onSpinsUpdate(this.remainingSpins);
        }

        this.currentWinOutcome = this.determineWinOutcome();

        const reelSymbols = this.buildReelsForOutcome(this.currentWinOutcome);
        this.rebuildReels(reelSymbols);

        const tweenPromises = [];

        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];
            const extra = Math.floor(Math.random() * this.config.grid.rows);

            let target: number;
            if (this.currentWinOutcome) {
                const rowPosition = this.currentWinOutcome.positions[i];
                const symbolIndex = rowPosition + 1;
                const baseTarget =
                    r.position +
                    this.config.gameplay.baseSpinRotations +
                    i * this.config.grid.columns +
                    extra;
                const desiredMod = (rowPosition + 1 - symbolIndex + r.symbols.length) % r.symbols.length;
                target = baseTarget - (baseTarget % r.symbols.length) + desiredMod;
                if (target < baseTarget) target += r.symbols.length;
            } else {
                target =
                    r.position +
                    this.config.gameplay.baseSpinRotations +
                    i * this.config.grid.columns +
                    extra;
            }

            while (target <= r.position) {
                target += r.symbols.length;
            }

            const time =
                this.config.gameplay.spinTime +
                i * this.config.gameplay.reelStaggerTime +
                extra * this.config.gameplay.reelStaggerTime;

            const promise = this.tweenTo(
                r,
                'position',
                target,
                time,
                this.backout(this.config.gameplay.backoutAmount),
                null,
                null
            );

            tweenPromises.push(promise);
        }

        await Promise.all(tweenPromises);
        this.reelsComplete();
    }

    private reelsComplete(): void {
        this.running = false;

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].position = Math.round(this.reels[i].position);
            this.reels[i].previousPosition = this.reels[i].position;
        }

        const result = {
            won: !!this.currentWinOutcome,
            reward: this.currentWinOutcome?.reward,
        };

        if (this.callbacks.onSpinComplete) {
            this.callbacks.onSpinComplete(result);
        }

        if (this.currentWinOutcome) {
            this.modalOpen = true;
            this.highlightWinningLine(this.currentWinOutcome);

            if (this.callbacks.onWin) {
                this.callbacks.onWin(this.currentWinOutcome.reward);
            }
        }
    }

    private updateSpinCounter(): void {
        this.spinCounterText.text = this.config.text.spinCounter(this.remainingSpins);
    }

    // ========================================================================
    // WIN ANIMATIONS & MODALS
    // ========================================================================

    private async highlightWinningLine(outcome: WinOutcome): Promise<void> {
        await this.flashWinningSymbols(outcome);
        this.createWinParticles(outcome);
        this.showWinModal(outcome);
    }

    private async flashWinningSymbols(outcome: WinOutcome): Promise<void> {
        const flashConfig = this.config.winAnimation;
        const highlights: Graphics[] = [];

        const totalReelWidth = this.config.grid.columns * this.config.grid.reelWidth;
        const startX = (this.app.screen.width - totalReelWidth) / 2;
        const startY = this.config.layout.topBarHeight;

        for (let col = 0; col < this.config.grid.columns; col++) {
            const row = outcome.positions[col];
            const x = startX + col * this.config.grid.reelWidth;
            const y = startY + row * this.config.grid.symbolSize;

            const highlight = new Graphics()
                .rect(0, 0, this.config.grid.symbolSize, this.config.grid.symbolSize)
                .stroke({ width: flashConfig.highlightWidth, color: flashConfig.highlightColor });

            highlight.x = x;
            highlight.y = y;
            highlight.zIndex = 999;
            highlights.push(highlight);
            this.app.stage.addChild(highlight);
        }

        for (let i = 0; i < flashConfig.flashCount; i++) {
            highlights.forEach((h) => (h.visible = !h.visible));
            await new Promise((resolve) => setTimeout(resolve, flashConfig.flashInterval));
        }

        highlights.forEach((h) => {
            this.app.stage.removeChild(h);
            h.destroy();
        });
    }

    private createWinParticles(outcome: WinOutcome): void {
        const particleConfig = this.config.particles.win;
        const totalReelWidth = this.config.grid.columns * this.config.grid.reelWidth;
        const startX = (this.app.screen.width - totalReelWidth) / 2;
        const startY = this.config.layout.topBarHeight;

        let emitCount = 0;
        const emitInterval = setInterval(() => {
            for (let col = 0; col < this.config.grid.columns; col++) {
                const row = outcome.positions[col];
                const x = startX + col * this.config.grid.reelWidth + this.config.grid.symbolSize / 2;
                const y = startY + row * this.config.grid.symbolSize + this.config.grid.symbolSize / 2;

                for (let i = 0; i < particleConfig.burstCount; i++) {
                    const particle = new Graphics()
                        .circle(0, 0, Math.random() * 3 + 2)
                        .fill({ color: particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)] });

                    particle.x = x;
                    particle.y = y;

                    const angle = (Math.PI * 2 * i) / particleConfig.burstCount + Math.random() * 0.5;
                    const speed = Math.random() * 5 + 3;
                    (particle as any).vx = Math.cos(angle) * speed;
                    (particle as any).vy = Math.sin(angle) * speed;
                    (particle as any).life = 1;

                    particle.zIndex = 1500;
                    this.app.stage.addChild(particle);

                    const particleTicker = () => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vy += 0.2;
                        particle.life -= 0.02;
                        particle.alpha = particle.life;

                        if (particle.life <= 0) {
                            this.app.stage.removeChild(particle);
                            particle.destroy();
                            this.app.ticker.remove(particleTicker);
                        }
                    };

                    this.app.ticker.add(particleTicker);
                }
            }

            emitCount++;
            if (emitCount >= particleConfig.emitCount) {
                clearInterval(emitInterval);
            }
        }, particleConfig.emitInterval);
    }

    private showWinModal(outcome: WinOutcome): void {
        const config = this.config.modals.win;
        const modalContainer = new Container();
        modalContainer.zIndex = 2000;

        const overlay = new Graphics().rect(0, 0, this.app.screen.width, this.app.screen.height).fill({ color: 0x000000, alpha: config.overlayAlpha });
        overlay.eventMode = 'static';
        modalContainer.addChild(overlay);

        const modalX = (this.app.screen.width - config.width) / 2;
        const modalY = (this.app.screen.height - config.height) / 2;

        const modalBg = new Graphics()
            .roundRect(modalX, modalY, config.width, config.height, config.borderRadius)
            .fill({ color: config.backgroundColor })
            .stroke({ width: config.borderWidth, color: config.borderColor });
        modalContainer.addChild(modalBg);

        const titleStyle = new TextStyle({
            fontFamily: config.titleStyle.family,
            fontSize: config.titleStyle.size,
            fontWeight: config.titleStyle.weight,
            fill: config.titleStyle.color,
        });

        const titleText = new Text({ text: config.title, style: titleStyle });
        titleText.anchor.set(0.5, 0);
        titleText.x = modalX + config.width / 2;
        titleText.y = modalY + 30;
        modalContainer.addChild(titleText);

        const prizeStyle = new TextStyle({
            fontFamily: config.prizeStyle.family,
            fontSize: config.prizeStyle.size,
            fill: config.prizeStyle.color,
        });

        const prizeText = new Text({ text: outcome.reward.title, style: prizeStyle });
        prizeText.anchor.set(0.5);
        prizeText.x = modalX + config.width / 2;
        prizeText.y = modalY + config.height / 2 - 20;
        modalContainer.addChild(prizeText);

        let buttonConfig: any;
        let buttonLabel: string;

        if (outcome.reward.type === this.config.prizeTypes?.BONUS) {
            buttonConfig = config.buttons.bonus;
            buttonLabel = buttonConfig.label;
        } else if (outcome.reward.type === this.config.prizeTypes?.IPHONE) {
            buttonConfig = config.buttons.iphone;
            buttonLabel = buttonConfig.label;
        } else if (outcome.reward.type === this.config.prizeTypes?.EXTRA_SPINS) {
            buttonConfig = config.buttons.extraSpins;
            buttonLabel = buttonConfig.label;
        } else {
            buttonConfig = config.buttons.bonus;
            buttonLabel = 'CLAIM';
        }

        const buttonContainer = new Container();
        buttonContainer.eventMode = 'static';
        buttonContainer.cursor = 'pointer';
        buttonContainer.x = modalX + (config.width - config.buttons.width) / 2;
        buttonContainer.y = modalY + config.height - 80;

        const button = new Graphics()
            .roundRect(0, 0, config.buttons.width, config.buttons.height, 10)
            .fill({ color: config.buttons.color });

        const buttonTextStyle = new TextStyle({
            fontFamily: config.buttons.textStyle.family,
            fontSize: config.buttons.textStyle.size,
            fontWeight: config.buttons.textStyle.weight,
            fill: config.buttons.textStyle.color,
        });

        const buttonText = new Text({ text: buttonLabel, style: buttonTextStyle });
        buttonText.anchor.set(0.5);
        buttonText.x = config.buttons.width / 2;
        buttonText.y = config.buttons.height / 2;

        buttonContainer.addChild(button);
        buttonContainer.addChild(buttonText);

        const closeModal = () => {
            this.app.stage.removeChild(modalContainer);
            modalContainer.destroy({ children: true });
            this.modalOpen = false;
        };

        buttonContainer.on('pointerdown', async () => {
            if (outcome.reward.type === this.config.prizeTypes?.EXTRA_SPINS) {
                const symbolConfig = this.config.symbols?.[outcome.symbolKey];
                if (symbolConfig && symbolConfig.spins) {
                    this.remainingSpins += symbolConfig.spins;
                    this.updateSpinCounter();
                }
                closeModal();
            } else if (outcome.reward.type === this.config.prizeTypes?.BONUS) {
                buttonText.text = buttonConfig.loadingLabel;
                buttonContainer.eventMode = 'none';

                try {
                    const response = await fetch(`https://frontend-api.engagefactory.dev/api/boosters/spinner/redeem`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            accept: 'application/json',
                        },
                        body: JSON.stringify({
                            bonusCode: outcome.reward.bonusCode,
                        }),
                    });

                    if (response.ok) {
                        buttonText.text = buttonConfig.successMessage;
                        setTimeout(() => {
                            buttonText.text = buttonConfig.closeLabel;
                            buttonContainer.eventMode = 'static';
                            buttonContainer.removeAllListeners();
                            buttonContainer.on('pointerdown', closeModal);
                        }, 2000);
                    } else {
                        buttonText.text = 'ERROR - Try Again';
                        buttonContainer.eventMode = 'static';
                    }
                } catch (error) {
                    buttonText.text = 'ERROR - Try Again';
                    buttonContainer.eventMode = 'static';
                }
            } else {
                closeModal();
            }
        });

        modalContainer.addChild(buttonContainer);
        this.app.stage.addChild(modalContainer);
        this.app.stage.sortChildren();
    }

    private showPrizesModal(): void {
        if (this.modalOpen) return;
        this.modalOpen = true;

        const config = this.config.modals.prizes;
        const modalContainer = new Container();
        modalContainer.zIndex = 2000;

        const overlay = new Graphics().rect(0, 0, this.app.screen.width, this.app.screen.height).fill({ color: 0x000000, alpha: config.overlayAlpha });
        overlay.eventMode = 'static';
        modalContainer.addChild(overlay);

        const modalX = (this.app.screen.width - config.width) / 2;
        const modalY = (this.app.screen.height - config.height) / 2;

        const modalBg = new Graphics()
            .roundRect(modalX, modalY, config.width, config.height, config.borderRadius)
            .fill({ color: config.backgroundColor })
            .stroke({ width: config.borderWidth, color: config.borderColor });
        modalContainer.addChild(modalBg);

        const titleStyle = new TextStyle({
            fontFamily: config.titleStyle.family,
            fontSize: config.titleStyle.size,
            fontWeight: config.titleStyle.weight,
            fill: config.titleStyle.color,
        });

        const titleText = new Text({ text: config.title, style: titleStyle });
        titleText.anchor.set(0.5, 0);
        titleText.x = modalX + config.width / 2;
        titleText.y = modalY + 20;
        modalContainer.addChild(titleText);

        const descStyle = new TextStyle({
            fontFamily: config.descStyle.family,
            fontSize: config.descStyle.size,
            fill: config.descStyle.color,
        });

        const descText = new Text({ text: config.matchDescription, style: descStyle });
        descText.anchor.set(0.5, 0);
        descText.x = modalX + config.width / 2;
        descText.y = modalY + 60;
        modalContainer.addChild(descText);

        let contentY = modalY + 100;

        const headerStyle = new TextStyle({
            fontFamily: config.itemStyle.family,
            fontSize: config.sectionHeaders.style.size,
            fontWeight: config.sectionHeaders.style.weight,
            fill: 0xffffff,
        });

        const contentStyle = new TextStyle({
            fontFamily: config.itemStyle.family,
            fontSize: config.itemStyle.size,
            fill: config.itemStyle.color,
        });

        const symbolSize = 30;

        if (this.config.symbols && this.config.prizeTypes) {
            const specialPrizes = Object.entries(this.config.symbols).filter(
                ([, value]: [string, any]) => value.type === this.config.prizeTypes.BONUS || value.type === this.config.prizeTypes.IPHONE
            );

            if (specialPrizes.length > 0) {
                const specialHeader = new Text({ text: config.sectionHeaders.special, style: headerStyle });
                specialHeader.x = modalX + 30;
                specialHeader.y = contentY;
                modalContainer.addChild(specialHeader);
                contentY += 35;

                specialPrizes.forEach(([key, symbolConfig]: [string, any]) => {
                    const symbol = new Sprite(this.slotTextures[key]);
                    const scale = symbolSize / Math.max(symbol.width, symbol.height);
                    symbol.scale.set(scale);
                    symbol.x = modalX + 60;
                    symbol.y = contentY;
                    modalContainer.addChild(symbol);

                    const prizeText = new Text({ text: symbolConfig.reward.title, style: contentStyle });
                    prizeText.x = modalX + 110;
                    prizeText.y = contentY + 5;
                    modalContainer.addChild(prizeText);

                    contentY += 40;
                });

                contentY += 10;
            }

            const spinHeader = new Text({ text: config.sectionHeaders.spins, style: headerStyle });
            spinHeader.x = modalX + 30;
            spinHeader.y = contentY;
            modalContainer.addChild(spinHeader);
            contentY += 35;

            const spinGroups: Record<string, string[]> = {};
            Object.entries(this.config.symbols).forEach(([key, value]: [string, any]) => {
                if (value.type === this.config.prizeTypes.EXTRA_SPINS) {
                    if (!spinGroups[value.spins]) {
                        spinGroups[value.spins] = [];
                    }
                    spinGroups[value.spins].push(key);
                }
            });

            Object.entries(spinGroups)
                .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                .forEach(([spins, symbolKeys]) => {
                    const symbolsToShow = symbolKeys.slice(0, 5);
                    let symbolX = modalX + 60;

                    symbolsToShow.forEach((key) => {
                        const symbol = new Sprite(this.slotTextures[key]);
                        const scale = (symbolSize * 0.8) / Math.max(symbol.width, symbol.height);
                        symbol.scale.set(scale);
                        symbol.x = symbolX;
                        symbol.y = contentY;
                        modalContainer.addChild(symbol);
                        symbolX += 38;
                    });

                    const remaining = symbolKeys.length - symbolsToShow.length;
                    if (remaining > 0) {
                        const moreText = new Text({
                            text: `+${remaining}`,
                            style: new TextStyle({
                                fontFamily: config.itemStyle.family,
                                fontSize: 14,
                                fill: 0x888888,
                            }),
                        });
                        moreText.x = symbolX + 5;
                        moreText.y = contentY + 10;
                        modalContainer.addChild(moreText);
                    }

                    const prizeText = new Text({
                        text: `+${spins} Spin${parseInt(spins) > 1 ? 's' : ''}`,
                        style: contentStyle,
                    });
                    prizeText.x = modalX + 280;
                    prizeText.y = contentY + 8;
                    modalContainer.addChild(prizeText);

                    contentY += 42;
                });
        }

        const closeButtonContainer = new Container();
        closeButtonContainer.eventMode = 'static';
        closeButtonContainer.cursor = 'pointer';
        closeButtonContainer.x = (this.app.screen.width - config.closeButton.width) / 2;
        closeButtonContainer.y = modalY + config.height - 70;

        const closeButton = new Graphics()
            .roundRect(0, 0, config.closeButton.width, config.closeButton.height, 10)
            .fill({ color: config.closeButton.color });

        const closeButtonTextStyle = new TextStyle({
            fontFamily: config.itemStyle.family,
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xffffff,
        });

        const closeButtonText = new Text({ text: config.closeButton.label, style: closeButtonTextStyle });
        closeButtonText.anchor.set(0.5);
        closeButtonText.x = config.closeButton.width / 2;
        closeButtonText.y = config.closeButton.height / 2;

        closeButtonContainer.addChild(closeButton);
        closeButtonContainer.addChild(closeButtonText);

        const closePrizesModal = () => {
            this.app.stage.removeChild(modalContainer);
            modalContainer.destroy({ children: true });
            this.modalOpen = false;
        };

        closeButtonContainer.on('pointerdown', closePrizesModal);
        overlay.on('pointerdown', closePrizesModal);

        modalContainer.addChild(closeButtonContainer);
        this.app.stage.addChild(modalContainer);
        this.app.stage.sortChildren();
    }

    // ========================================================================
    // TICKER CALLBACKS
    // ========================================================================

    private setupTickerCallbacks(): void {
        // Reel animation ticker
        this.app.ticker.add(() => {
            for (let i = 0; i < this.reels.length; i++) {
                const r = this.reels[i];
                r.blur.blurY = (r.position - r.previousPosition) * this.config.gameplay.blurIntensity;
                r.previousPosition = r.position;

                for (let j = 0; j < r.symbols.length; j++) {
                    const s = r.symbols[j];
                    const prevy = (s as any).baseY || s.y;
                    const newBaseY = (((r.position + j) % r.symbols.length) - 1) * this.config.grid.symbolSize;

                    const scale = Math.min(
                        this.config.grid.symbolSize / s.texture.width,
                        this.config.grid.symbolSize / s.texture.height
                    );
                    const symbolHeight = s.texture.height * scale;
                    s.y = newBaseY + Math.round((this.config.grid.symbolSize - symbolHeight) / 2);
                    (s as any).baseY = newBaseY;

                    if (newBaseY < 0 && prevy > this.config.grid.symbolSize) {
                        const newSymbolKey = r.symbolKeys[j];
                        s.texture = this.slotTextures[newSymbolKey];
                        (s as any).symbolKey = newSymbolKey;

                        const newScale = Math.min(
                            this.config.grid.symbolSize / s.texture.width,
                            this.config.grid.symbolSize / s.texture.height
                        );
                        s.scale.x = s.scale.y = newScale;
                        s.x = Math.round((this.config.grid.symbolSize - s.texture.width * newScale) / 2);

                        const newSymbolHeight = s.texture.height * newScale;
                        s.y = newBaseY + Math.round((this.config.grid.symbolSize - newSymbolHeight) / 2);
                    }
                }
            }
        });

        // Tweening ticker
        this.app.ticker.add(() => {
            const now = Date.now();
            const remove: any[] = [];

            for (let i = 0; i < this.tweening.length; i++) {
                const t = this.tweening[i];
                const phase = Math.min(1, (now - t.start) / t.time);

                t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
                if (t.change) t.change(t);
                if (phase === 1) {
                    t.object[t.property] = t.target;
                    if (t.complete) t.complete(t);
                    remove.push(t);
                }
            }
            for (let i = 0; i < remove.length; i++) {
                this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
            }
        });
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    private tweenTo(
        object: any,
        property: string,
        target: number,
        time: number,
        easing: (t: number) => number,
        onchange: ((tween: any) => void) | null,
        oncomplete: (() => void) | null
    ): Promise<void> {
        return new Promise((resolve) => {
            const tween = {
                object,
                property,
                propertyBeginValue: object[property],
                target,
                easing,
                time,
                change: onchange,
                complete: () => {
                    if (oncomplete) oncomplete();
                    resolve();
                },
                start: Date.now(),
            };
            this.tweening.push(tween);
        });
    }

    private lerp(a1: number, a2: number, t: number): number {
        return a1 * (1 - t) + a2 * t;
    }

    private backout(amount: number): (t: number) => number {
        return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
    }

    private interpolateColor(color1: number, color2: number, ratio: number): number {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;

        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    public on(event: 'spinStart' | 'spinComplete' | 'spinsUpdate' | 'win', callback: Function): void {
        if (event === 'spinStart') {
            this.callbacks.onSpinStart = callback as () => void;
        } else if (event === 'spinComplete') {
            this.callbacks.onSpinComplete = callback as (result: { won: boolean; reward?: ApiReward }) => void;
        } else if (event === 'spinsUpdate') {
            this.callbacks.onSpinsUpdate = callback as (remaining: number) => void;
        } else if (event === 'win') {
            this.callbacks.onWin = callback as (reward: ApiReward) => void;
        }
    }

    public getSpinsRemaining(): number {
        return this.remainingSpins;
    }

    public isSpinning(): boolean {
        return this.running;
    }

    public resize(): void {
        // Recalculate dimensions and reposition elements
        this.calculateGridDimensions();
        // You would need to update positions of all UI elements here
        // This is a simplified version - full implementation would reposition everything
    }

    public destroy(): void {
        this.app.ticker.stop();
        this.app.destroy(true, { children: true, texture: true, textureSource: true });
    }
}
