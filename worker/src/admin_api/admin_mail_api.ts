import { Context } from "hono";
import { handleMailListQuery } from "../common";
import i18n from "../i18n";

export default {
    getMails: async (c: Context<HonoCustomType>) => {
        const { address, limit, offset } = c.req.query();
        const addressQuery = address ? `address = ?` : "";
        const addressParams = address ? [address] : [];
        const filterQuerys = [addressQuery].filter((item) => item).join(" and ");
        const finalQuery = filterQuerys.length > 0 ? `where ${filterQuerys}` : "";
        const filterParams = [...addressParams]
        return await handleMailListQuery(c,
            `SELECT * FROM raw_mails ${finalQuery}`,
            `SELECT count(*) as count FROM raw_mails ${finalQuery}`,
            filterParams, limit, offset
        );
    },
    getUnknowMails: async (c: Context<HonoCustomType>) => {
        const { limit, offset } = c.req.query();
        return await handleMailListQuery(c,
            `SELECT * FROM raw_mails where address NOT IN (select name from address) `,
            `SELECT count(*) as count FROM raw_mails`
            + ` where address NOT IN (select name from address) `,
            [], limit, offset
        );
    },
    deleteMail: async (c: Context<HonoCustomType>) => {
        const msgs = i18n.getMessagesbyContext(c);
        const { id } = c.req.param();
        if (!id) {
            return c.text(msgs.InvalidInputMsg, 400)
        }
        const { success } = await c.env.DB.prepare(
            `DELETE FROM raw_mails WHERE id = ? `
        ).bind(id).run();
        if (!success) {
            return c.text(msgs.OperationFailedMsg, 500)
        }
        return c.json({
            success: true
        })
    }
}
