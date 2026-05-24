/** @jsxImportSource @opentui/solid */
/** @jsxRuntime automatic */
import type { TuiPlugin, TuiSlotContext, TuiHostSlotMap } from "@opencode-ai/plugin/tui"
import type { Provider } from "@opencode-ai/sdk"
import { createSignal, onCleanup } from "solid-js"

function getContextLimit(providers: readonly Provider[], modelID: string, providerID: string): number {
  for (const p of providers) {
    if (p.id !== providerID) continue
    const m = p.models[modelID]
    if (m) return m.limit.context
  }
  return 0
}

function makeBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width)
  const empty = width - filled
  return "█".repeat(Math.max(0, filled)) + "░".repeat(Math.max(0, empty))
}

function barColor(percent: number): string {
  if (percent < 60) return "white"
  if (percent < 90) return "yellow"
  return "red"
}

const plugin: TuiPlugin = async (api, _options, _meta) => {
  api.slots.register({
    order: 0,
    slots: {
      session_prompt_right(_ctx: TuiSlotContext, value: TuiHostSlotMap["session_prompt_right"]) {
        const [percent, setPercent] = createSignal(0)

        const update = () => {
          try {
            const sessionID = value.session_id
            if (!sessionID) return

            const msgs = api.state.session.messages(sessionID)
            if (!msgs || msgs.length === 0) return

            const assistantMsgs = [...msgs].filter((m: any) => m.role === "assistant")
            const last = [...assistantMsgs].reverse().find((m: any) => {
              if (!m.tokens) return false
              const t = m.tokens
              const total = (t.input ?? 0) + (t.cache?.read ?? 0) + (t.cache?.write ?? 0)
              return total > 0
            }) as any
            if (!last) return

            const t = last.tokens
            const total = (t.input ?? 0) + (t.cache?.read ?? 0) + (t.cache?.write ?? 0)
            const contextLimit = getContextLimit(api.state.provider as any[], last.modelID, last.providerID)

            if (contextLimit <= 0) return

            setPercent(Math.min(100, (total / contextLimit) * 100))
          } catch {}
        }

        update()
        const unsubStep = api.event.on("session.next.step.ended" as any, () => update())
        const unsubMsg = api.event.on("message.updated" as any, () => update())
        onCleanup(() => {
          unsubStep?.()
          unsubMsg?.()
        })

        return <text fg={barColor(percent())}>{makeBar(percent(), 10)}</text>
      },
    },
  })
}

const pluginModule = {
  id: "context-progress-bar",
  tui: plugin,
}

export default pluginModule
