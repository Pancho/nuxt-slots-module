import { defineEventHandler, readBody, createError } from 'h3'

// ============================================================================
// TYPES (matching your actual API structure)
// ============================================================================

interface Asset {
  id: number
  title: string
  imageUrl: string
}

interface RewardAsset {
  id: number  // Asset ID
  count: number  // How many of this asset needed for the win
}

interface Reward {
  id: number
  title: string
  bonusCode: string
  type: string  // 'extra_spins', 'big_win', etc.
  probability: number  // Weight for selection
  assets: RewardAsset[]  // Which assets needed and how many
}

interface GameConfig {
  id: number
  rows: number
  columns: number
  title: string
  logoImage: string
  backgroundImage: string
  assets: Asset[]
  rewards: Reward[]
}

interface SpinRequest {
  gameId: string | number
  userId?: string
  sessionId?: string
}

interface WinOutcome {
  symbolKey: string  // The asset title that won
  positions: number[]  // Position on each reel (column)
  reward: Reward
}

interface SpinResponse {
  won: boolean
  outcome: WinOutcome | null
  remainingSpins: number
  spinId: string
  timestamp: number
}

// ============================================================================
// IN-MEMORY STORAGE (Replace with real database in production)
// ============================================================================

// Simulated user database
const USERS_DB = new Map<string, {
  id: string
  spinsRemaining: number
  totalSpins: number
  totalWins: number
}>()

// Initialize test user with spins
USERS_DB.set('test-user', {
  id: 'test-user',
  spinsRemaining: 15,
  totalSpins: 0,
  totalWins: 0
})

// Spin history for auditing
const SPIN_HISTORY: Array<{
  spinId: string
  userId: string
  gameId: string | number
  won: boolean
  rewardId?: number
  timestamp: number
}> = []

// Game configuration cache (loaded from your API)
let GAME_CONFIG_CACHE: GameConfig | null = null

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default defineEventHandler(async (event): Promise<SpinResponse> => {
  try {
    // 1. Parse request
    const body = await readBody<SpinRequest>(event)

    console.log('🎰 Spin request:', {
      gameId: body.gameId,
      userId: body.userId
    })

    // Validate
    if (!body.gameId) {
      throw createError({
        statusCode: 400,
        message: 'gameId is required'
      })
    }

    // 2. Authenticate user (TODO: Replace with real auth)
    const userId = body.userId || 'test-user'

    // 3. Get user from database
    let user = USERS_DB.get(userId)
    if (!user) {
      // Create new user
      user = {
        id: userId,
        spinsRemaining: 15,
        totalSpins: 0,
        totalWins: 0
      }
      USERS_DB.set(userId, user)
      console.log('👤 New user created:', userId)
    }

    // 4. Check spin balance
    if (user.spinsRemaining <= 0) {
      throw createError({
        statusCode: 400,
        message: 'No spins remaining'
      })
    }

    // 5. Load game configuration
    const gameConfig = await loadGameConfig(Number(body.gameId))

    // 6. 🎲 DETERMINE WIN OUTCOME (SERVER-SIDE - SECURE!)
    const outcome = determineWinOutcome(gameConfig)

    // 7. Generate unique spin ID
    const spinId = generateSpinId()

    // 8. Update user spins
    user.spinsRemaining -= 1
    user.totalSpins += 1

    // 9. Handle extra spins if won
    if (outcome && outcome.reward.type === 'extra_spins') {
      // Parse the title to get spin count (e.g., "+5 Spins" -> 5)
      const spinMatch = outcome.reward.title.match(/\+(\d+)\s+Spins?/i)
      if (spinMatch) {
        const extraSpins = parseInt(spinMatch[1])
        user.spinsRemaining += extraSpins
        console.log(`🎁 Added ${extraSpins} extra spins!`)
      }
    }

    // 10. Update stats
    if (outcome) {
      user.totalWins += 1
      console.log('🎉 WIN:', outcome.reward.title)
    } else {
      console.log('😐 No win')
    }

    // 11. Save to history
    SPIN_HISTORY.push({
      spinId,
      userId,
      gameId: body.gameId,
      won: !!outcome,
      rewardId: outcome?.reward.id,
      timestamp: Date.now()
    })

    // 12. Log stats
    console.log('📊 Stats:', {
      spinsRemaining: user.spinsRemaining,
      totalSpins: user.totalSpins,
      winRate: user.totalSpins > 0
        ? ((user.totalWins / user.totalSpins) * 100).toFixed(1) + '%'
        : '0%'
    })

    // 13. Return response
    const response: SpinResponse = {
      won: !!outcome,
      outcome: outcome,
      remainingSpins: user.spinsRemaining,
      spinId: spinId,
      timestamp: Date.now()
    }

    return response

  } catch (error: any) {
    console.error('❌ Spin error:', error)

    // Return appropriate error
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to process spin'
    })
  }
})

// ============================================================================
// GAME LOGIC FUNCTIONS
// ============================================================================

/**
 * Load game configuration from your API
 * In production: Cache this or load from database
 */
async function loadGameConfig(gameId: number): Promise<GameConfig> {
  // Check cache first
  if (GAME_CONFIG_CACHE && GAME_CONFIG_CACHE.id === gameId) {
    return GAME_CONFIG_CACHE
  }

  try {
    // TODO: Replace with your actual API endpoint
    const response = await $fetch<GameConfig>(
      `https://frontend-api.engagefactory.dev/api/boosters/spinner/${gameId}/en`
    )

    GAME_CONFIG_CACHE = response
    return response

  } catch (error) {
    console.error('Failed to load game config:', error)

    // Fallback to hardcoded config for development
    return getDefaultGameConfig()
  }
}

/**
 * Default/fallback game configuration
 * This matches your actual API response
 */
function getDefaultGameConfig(): GameConfig {
  return {
    id: 1,
    rows: 4,
    columns: 5,
    title: "Welcome Spinner",
    logoImage: "https://engagefactory.b-cdn.net/ef/spinner/logo-engage-factory.svg",
    backgroundImage: "https://engagefactory.b-cdn.net/ef/spinner/BaseGameBackground.png",
    assets: [
      { id: 1, title: "gatesofolympuslogo", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/gatesofolympuslogo.png" },
      { id: 2, title: "SW", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/SW.png" },
      { id: 3, title: "SW1", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/SW1.png" },
      { id: 4, title: "SW2", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/SW2.png" },
      { id: 5, title: "S1", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/S1.png" },
      { id: 6, title: "M5", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/M5.png" },
      { id: 7, title: "M4", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/M4.png" },
      { id: 8, title: "M3", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/M3.png" },
      { id: 9, title: "M2", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/M2.png" },
      { id: 10, title: "M1", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/M1.png" },
      { id: 11, title: "L5", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/L5.png" },
      { id: 12, title: "L4", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/L4.png" },
      { id: 13, title: "L3", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/L3.png" },
      { id: 14, title: "L2", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/L2.png" },
      { id: 15, title: "L1", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/L1.png" },
      { id: 16, title: "C5", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C5.png" },
      { id: 17, title: "C10", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C10.png" },
      { id: 18, title: "C25", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C25.png" },
      { id: 19, title: "C100", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C100.png" },
      { id: 20, title: "B", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/B.png" },
      { id: 21, title: "C250", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C250.png" },
      { id: 22, title: "C1000", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C1000.png" },
      { id: 23, title: "C5000", imageUrl: "https://engagefactory.b-cdn.net/ef/spinner/C5000.png" }
    ],
    rewards: [
      {
        id: 1,
        title: "'+5 Spins",
        bonusCode: "WELCOME5",
        type: "extra_spins",
        probability: 4,
        assets: [{ id: 1, count: 5 }] // Need 5x gatesofolympuslogo
      },
      {
        id: 2,
        title: "+4 Spins",
        bonusCode: "WELCOME4",
        type: "extra_spins",
        probability: 10,
        assets: [{ id: 2, count: 3 }] // Need 3x SW
      },
      {
        id: 3,
        title: "Iphone",
        bonusCode: "WELCOME50",
        type: "big_win",
        probability: 0.5,
        assets: [
          { id: 1, count: 2 },  // 2x gatesofolympuslogo
          { id: 2, count: 2 }   // 2x SW
        ]
      }
    ]
  }
}

/**
 * 🎲 DETERMINE WIN OUTCOME
 * This is the critical function that decides if the player wins
 *
 * Your rewards structure:
 * - Reward 1: +5 Spins (prob: 4) - needs 5x "gatesofolympuslogo"
 * - Reward 2: +4 Spins (prob: 10) - needs 3x "SW"
 * - Reward 3: iPhone (prob: 0.5) - needs 2x "gatesofolympuslogo" + 2x "SW"
 */
function determineWinOutcome(gameConfig: GameConfig): WinOutcome | null {
  if (!gameConfig.rewards || gameConfig.rewards.length === 0) {
    return null
  }

  // Calculate total probability weight
  const totalWeight = gameConfig.rewards.reduce((sum, r) => sum + r.probability, 0)

  // Add "no win" weight (adjust this to control overall win rate)
  // Higher = less wins. Example: totalWeight * 5 means ~16% win rate
  const noWinWeight = totalWeight * 5
  const totalWithNoWin = totalWeight + noWinWeight

  // Roll the dice
  const roll = Math.random() * totalWithNoWin

  // Check if it's a loss
  if (roll >= totalWeight) {
    return null  // No win
  }

  // Determine which reward won
  let cumulative = 0
  for (const reward of gameConfig.rewards) {
    cumulative += reward.probability
    if (roll < cumulative) {
      // This reward won! Now build the outcome
      return buildWinOutcome(gameConfig, reward)
    }
  }

  return null
}

/**
 * Build a win outcome for the selected reward
 * This determines WHERE the winning symbols will appear
 */
function buildWinOutcome(gameConfig: GameConfig, reward: Reward): WinOutcome {
  // Get the primary winning asset (first one in the assets array)
  const primaryAsset = reward.assets[0]
  const asset = gameConfig.assets.find(a => a.id === primaryAsset.id)

  if (!asset) {
    throw new Error(`Asset ${primaryAsset.id} not found in game config`)
  }

  // Generate random positions for each column (reel)
  // These positions tell the client where to place the symbols
  const positions: number[] = []
  for (let col = 0; col < gameConfig.columns; col++) {
    // Random row position (0 to rows-1)
    positions.push(Math.floor(Math.random() * gameConfig.rows))
  }

  return {
    symbolKey: asset.title,  // e.g., "gatesofolympuslogo" or "SW"
    positions: positions,     // e.g., [1, 2, 0, 3, 1]
    reward: reward
  }
}

/**
 * Generate unique spin ID for tracking
 */
function generateSpinId(): string {
  return `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
