import mitt from 'mitt'

type Events = {
  startAgent: void
}

export const eventBus = mitt<Events>()
