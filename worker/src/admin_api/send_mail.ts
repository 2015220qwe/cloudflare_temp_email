import { Context } from "hono";
import { sendMail } from "../mails_api/send_mail_api";
import i18n from "../i18n";

export const sendMailbyAdmin = async (c: Context<HonoCustomType>) => {
    const msgs = i18n.getMessagesbyContext(c);
    const {
        from_name, from_mail,
        to_mail, to_name,
        subject, content, is_html
    } = await c.req.json();
    if (!from_mail || !to_mail) {
        return c.text(msgs.InvalidInputMsg, 400)
    }
    try {
        await sendMail(c, from_mail, {
            from_name: from_name,
            to_name: to_name,
            to_mail: to_mail,
            subject: subject,
            content: content,
            is_html: is_html,
        }, {
            isAdmin: true
        })
    } catch (e) {
        console.error("Failed to send mail", e);
        return c.text(`Failed to send mail: ${(e as Error).message}`, 400)
    }
    return c.json({ status: "ok" });
}
