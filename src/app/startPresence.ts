import { ActivityType, Client } from "discord.js";

export function startPresenceRotation(client: Client) {
	const activities = [
		{
			name: "/help para comandos",
			type: ActivityType.Listening,
		},
		{
			name: "músicas no Discord com /play",
			type: ActivityType.Playing,
		},
		{
			name: "suas rolagens de dados",
			type: ActivityType.Watching,
		},
	];

	let index = 0;

	const updatePresence = () => {
		const activity = activities[index];

		client.user?.setPresence({
			status: "online",
			activities: [activity],
		});

		index = (index + 1) % activities.length;
	};

	updatePresence();

	setInterval(updatePresence, 60_000);
}