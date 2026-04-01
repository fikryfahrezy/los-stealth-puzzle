<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createCampaignState, createRuntimeSnapshot } from './game/campaign'
import { campaignLevels } from './game/level'
import { createGameRuntime, type GameRuntimeHandle } from './game/runtime'
import type { RuntimeSnapshot } from './game/types'

const runtimeHost = ref<HTMLDivElement | null>(null)
const snapshot = ref<RuntimeSnapshot>(createRuntimeSnapshot(createCampaignState(campaignLevels)))

let runtime: GameRuntimeHandle | null = null

const statusLabel = computed(() => {
  if (snapshot.value.campaignComplete) {
    return 'Campaign Complete'
  }
  if (snapshot.value.gameState.status === 'failed') {
    return 'Detected'
  }
  if (snapshot.value.canAdvance) {
    return 'Level Cleared'
  }
  if (snapshot.value.gameState.status === 'success') {
    return 'Escaped'
  }
  return 'Infiltrating'
})

const statusMessage = computed(() => {
  if (snapshot.value.campaignComplete) {
    return 'You cleared every level from easiest to hardest. Replay the campaign to sharpen the route.'
  }
  if (snapshot.value.gameState.status === 'failed') {
    return 'A guard caught you in direct sight. Restart this level, wait out the watch phases, and try a different path.'
  }
  if (snapshot.value.canAdvance) {
    return 'The current route is solved. Move on to the next harder level or replay this one.'
  }
  if (snapshot.value.gameState.status === 'success') {
    return 'You crossed the exit zone unseen. The final challenge is complete.'
  }
  return snapshot.value.level.summary
})

const levelLabel = computed(
  () => `Level ${snapshot.value.currentLevelIndex + 1} / ${snapshot.value.totalLevels}`
)

const guardCount = computed(() => snapshot.value.level.guards.length)

const restartLevel = () => {
  if (snapshot.value.campaignComplete) {
    runtime?.replayCampaign()
    return
  }

  runtime?.restartLevel()
}

const advanceLevel = () => {
  runtime?.advanceLevel()
}

onMounted(() => {
  if (!runtimeHost.value) {
    return
  }

  runtime = createGameRuntime(runtimeHost.value, (state) => {
    snapshot.value = state
  })
})

onBeforeUnmount(() => {
  runtime?.dispose()
})
</script>

<template>
  <main class="shell">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Line-of-Sight Stealth Puzzle</p>
        <h1>Slip through patrols without crossing a single clear sightline.</h1>
        <p class="level-chip">{{ levelLabel }} · {{ snapshot.level.name }}</p>
        <p class="summary">
          {{ snapshot.level.summary }}
        </p>
      </div>

      <div class="status-card" :data-state="snapshot.gameState.status">
        <p class="status-label">{{ statusLabel }}</p>
        <p class="status-message">{{ statusMessage }}</p>
        <div class="status-actions">
          <button class="restart-button" type="button" @click="restartLevel">
            {{ snapshot.campaignComplete ? 'Replay campaign' : 'Restart level' }}
          </button>
          <button v-if="snapshot.canAdvance" class="secondary-button" type="button" @click="advanceLevel">
            Next level
          </button>
        </div>
      </div>
    </section>

    <section class="playfield">
      <aside class="briefing-panel">
        <div>
          <p class="panel-heading">Mission brief</p>
          <ul class="instruction-list">
            <li>Move with <strong>WASD</strong> or the arrow keys.</li>
            <li>Red wedges show each guard's current field of view.</li>
            <li>Some guards stop, turn, and watch another lane before resuming patrol.</li>
            <li>Walls block vision as well as your movement.</li>
            <li>Reach the amber square to unlock the next harder level.</li>
          </ul>
        </div>

        <div class="telemetry-grid">
          <div>
            <span>Level</span>
            <strong>{{ levelLabel }}</strong>
          </div>
          <div>
            <span>Guards</span>
            <strong>{{ guardCount }}</strong>
          </div>
          <div>
            <span>Run state</span>
            <strong>{{ statusLabel }}</strong>
          </div>
          <div>
            <span>Objective</span>
            <strong>{{ snapshot.campaignComplete ? 'Replay from start' : 'Reach exit' }}</strong>
          </div>
        </div>
      </aside>

      <div class="viewport-frame">
        <div ref="runtimeHost" class="viewport"></div>
      </div>
    </section>
  </main>
</template>