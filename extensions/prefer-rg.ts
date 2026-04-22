// @ts-nocheck
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

type PreferRgState = {
	enabled: boolean;
	enforce: boolean;
};

const STATE_TYPE = "prefer-rg-state";

export default function preferRgExtension(pi: ExtensionAPI) {
	let enabled = true;
	let enforce = false;

	const persistState = () => {
		pi.appendEntry(STATE_TYPE, {
			enabled,
			enforce,
		} satisfies PreferRgState);
	};

	pi.on("session_start", async (_event, ctx) => {
		for (const entry of [...ctx.sessionManager.getEntries()].reverse()) {
			if (
				entry.type === "custom" &&
				entry.customType === STATE_TYPE &&
				entry.data &&
				typeof entry.data === "object"
			) {
				const data = entry.data as Partial<PreferRgState>;
				enabled = data.enabled ?? true;
				enforce = data.enforce ?? false;
				return;
			}
		}
	});

	pi.registerCommand("prefer-rg", {
		description:
			"Configure ripgrep preference: /prefer-rg [on|off|enforce-on|enforce-off|status]",
		handler: async (args, ctx) => {
			switch ((args || "status").trim()) {
				case "on":
					enabled = true;
					persistState();
					ctx.ui.notify("prefer-rg enabled", "info");
					return;
				case "off":
					enabled = false;
					persistState();
					ctx.ui.notify("prefer-rg disabled", "info");
					return;
				case "enforce-on":
					enabled = true;
					enforce = true;
					persistState();
					ctx.ui.notify("prefer-rg enabled with bash enforcement", "info");
					return;
				case "enforce-off":
					enforce = false;
					persistState();
					ctx.ui.notify("prefer-rg enforcement disabled", "info");
					return;
				case "status":
				case "":
					ctx.ui.notify(
						`prefer-rg: ${enabled ? "on" : "off"}, enforcement: ${enforce ? "on" : "off"}`,
						"info",
					);
					return;
				default:
					ctx.ui.notify(
						"Usage: /prefer-rg [on|off|enforce-on|enforce-off|status]",
						"warning",
					);
			}
		},
	});

	pi.on("before_agent_start", async (event) => {
		if (!enabled) return undefined;

		return {
			systemPrompt:
				event.systemPrompt +
				`

IMPORTANT:
- When using shell search commands, prefer ripgrep (\`rg\`) over grep.
- Use \`rg\` by default for recursive text and code search.
- Only use \`grep\` if the user explicitly asks for grep or grep-specific behavior is required.
- When proposing shell examples, prefer commands like \`rg "pattern" .\` instead of \`grep -R "pattern" .\`.
`,
		};
	});

	pi.on("tool_call", async (event) => {
		if (!enabled || !enforce) return;
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command?.trim();
		if (!command) return;

		if (/^grep(\s|$)/.test(command)) {
			return {
				block: true,
				reason:
					"Use ripgrep (`rg`) instead of `grep` for search commands unless grep-specific behavior is required.",
			};
		}
	});
}
