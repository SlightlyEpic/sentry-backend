import type { APIEmbed } from 'discord.js';
import { Long } from 'mongodb';

// This file wont be used for now

// Some fields are camel case because these are schema types
// of an existing database

export type Message = {
    name: string
    id: string
    content: string
    attachments: string[]
    type: string
    embed: APIEmbed
    buttons: string[]           // this is just a list of custom button unique ids, the user would select from a menu of existing custom buttons from the database
}

type Action = {
    name: string
    template_name: string
}

export type Button = {
    label: string
    unique_id: string
    color: string
    actions: Action[]
    url: string
    id: string
}

export type MenuOption = {
    label: string
    description: string
    actions: {
        name: string
        role: number
    }[]
    emoji: string | null
}

export type Menu = {
    placeholder: string
    options: MenuOption[]
    id: string
}

export type Punishment = {
    warningsCount: number
    duration_raw: string
    duration: number
    warningSeverity: string
    action: string
}

export type Permit = {
    name: string
    locked: boolean
    permissions: string[]
    roles: string[]             // Role Ids
    users: string[]             // User Ids
}

export type AdWarn = {
    status: boolean
    channel: string
    message_template: Message | null
    send_dm: boolean,
}

export type Premium = {
    status: boolean
    activated_by: string
    activated_timestamp: number | null
    end_timestamp: number | null
    from_code: string | null
}

export type Case = {
    id: string
    created_timestamp: number
    user_info: {
        id: string
        name: string
        avatar: string
    }
    reason: string
    proof: string | null
    action: {
        type: string
        warn_severity: string
        active: boolean
        ends_timestamp: number | null
    }
    duration: number | null
    humanized_duration: string | null
    moderator_info: {
        id: string
        name: string
        avatar: string
    }
    moderator_note: {
        content: string | null
        last_edited_user: string | null
    }
}

export type ModStat = {
    adwarnings_issued: string
    warnings_issued: string
    mutes_issued: string
    kicks_issued: string
    bans_issued: string
}

export type Appeals = {
    enabled_categories: unknown[]
    reponses_channel: string | null
    form_questions: { [key: string]: string[] }
    data: unknown
}

export type Report = unknown

export type ApplicationQuestion = {
    question_text: string
    answer_type: string
    answer_choices?: string[]
    max_answers?: number
}

export type Application = {
    name: string
    id: string
    status: boolean
    response_channel: string
    questions: ApplicationQuestion[]
    required_roles: string[]
    blacklisted_roles: string[]
    ping_roels: string[]
    add_roles: string[]
    remove_roles: string[]
    accepted_response_template: Message | null
    declined_response_tempalte: Message | null
    cooldown: number
    secondary_guild: string | null
}

export type Guild = {
    _id: Long
    prefix: string
    custom_permits: Permit[]
    premium: Premium
    server_language: string
    flags: string[]
    compact_responses: boolean
    infraction_tracking: boolean
    delete_cases_after: number
    cases: Case[]
    warn_punishments: Punishment[]
    mod_stats: {
        status: boolean
        data: {
            [key: string]: ModStat[]
        }
    }
    appeals: Appeals
    adwarning_settings: AdWarn
    bot_logs_channel: string | null
    templates: {
        messages: Message[]
        buttons: Button[]
        menus: Menu[]
    }
    reports: {
        status: boolean
        channel: string | null
        data: Report[]
    }
    applications: Application[]
}
