import { CommandInteraction } from "oceanic.js";
import { IHushCommand } from "../../bot";
import { Users } from "../../databases/user/models";
import { color_data } from "../../data/colors";;

const modAnonRerollCommand: IHushCommand = {
    data: {
        type: 1,
        name: "mod_reroll_anon",
        description: "Rerolls the anonymous username of specified anonyomus user.",
        defaultMemberPermissions: "4",
        options: [
            {
                type: 3,
                name: "name",
                description: "Name of anonymous user to reroll.",
                required: true
            },
            {
                type: 3,
                name: "color",
                description: "Name of color to force when rerolling. Leave empty for random.",
                required: false
            }
        ]
    },
    async execute(interaction: CommandInteraction) {
        
        const guild_id = interaction.guildID!;
        const name_option = interaction.data.options.getString("name")!;
        const color_option = interaction.data.options.getString("color");

        const fields = ["anon_id", "anon_color"];
        let anon_info: [string, number];

        try {
            if(color_option) {
                const color_category = color_data.find(x => x.category_name === color_option)
                if(!color_category) {
                    await interaction.createMessage({ content: "Color wasn't found.", flags: 64 });
                    return;
                }
                anon_info = await Users.generateAnonID(guild_id, color_category);
            } else {
                anon_info = await Users.generateAnonID(guild_id);
            }
            const values = [anon_info[0], anon_info[1]];

            const changed_anon = await Users.changeAnon(guild_id, name_option, fields, values);
            if(!changed_anon) {
                await interaction.createMessage({ content: "User wasn't found.", flags: 64 });
                return;
            }

        } catch(error) {
            console.log(error);
            await interaction.createMessage({ content: "Something went wrong while interacting with the database.", flags: 64 });
            return;
        }
        await interaction.createMessage({ content: `${name_option}'s tag was successfully rerolled to: ${anon_info[0]}`, flags: 64});
    }
}

export default modAnonRerollCommand;