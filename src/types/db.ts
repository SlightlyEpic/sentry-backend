import type { APIEmbed } from 'discord.js';

export type Message = {
    name: string
    id: string
    content: string
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
    emoji: string
}

export type Menu = {
    placeholder: string
    options: MenuOption[]
    id: string
}

export type Punishment = {
    warningsCount: string
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
    dmStatus: boolean,
    message: Message
}

export type Guild = {
    prefix: string
    punishments: Punishment[]
    permits: Permit[]
    adWarn: AdWarn
}
