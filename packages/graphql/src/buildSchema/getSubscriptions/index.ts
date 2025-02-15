import getType from '../getType'
import getArgs from '../getArgs'

export default async function ({subscriptions, options}) {
  const fields = {}

  for (const key of Object.keys(subscriptions)) {
    const subscription = subscriptions[key]
    subscription.key = key

    const type = await getType(subscription.returns, options)
    const args = await getArgs(subscription.params)
    fields[key] = {
      type,
      args,
      async subscribe(root, params, viewer) {
        return await subscription.subscribe(params, viewer)
      }
    }
  }

  return fields
}
