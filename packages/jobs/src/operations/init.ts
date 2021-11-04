import {Agenda} from 'agenda/es'
import {AgendaConfig} from 'agenda/dist/agenda'

import initJobs from '../initJobs'
import {JobMap} from '../types/job'
import {JobManager} from '../JobManager'

export interface InitOptions {
  jobs: JobMap
  /**
   * If included, will prefix all job names with the given namespace
   */
  namespace?: string

  agendaConfig?: AgendaConfig

  /**
   * The address of the mongodb where jobs will be stored
   */
  dbAddress?: string

  /**
   * The collection where jobs will be stored. Defaults to orion_v3_jobs
   */
  dbCollection?: string

  /**
   * If set to true, will initialize jobs but won't start running them. Single jobs can still be scheduled so that they run in another machine.
   */
  disabled?: boolean
}

export async function init(opts: InitOptions) {
  const {
    jobs,
    agendaConfig = {},
    dbAddress = process.env.MONGO_URL,
    dbCollection = 'orion_v3_jobs',
    disabled = process.env.ORION_TEST ? true : false,
    namespace = ''
  } = opts

  if (!dbAddress) {
    throw new Error(
      'No dbAddress provided to Jobs. Please provide it either through opts or set the MONGO_URL env var.'
    )
  }

  const agenda = new Agenda({
    db: {
      address: dbAddress,
      collection: dbCollection
    },
    ...agendaConfig
  })

  JobManager.init(agenda, {namespace})

  if (disabled) {
    console.log('Skipping jobs.start(). ORION_TEST env var or disabled option is set.')
  } else {
    await JobManager.start()
  }

  await initJobs(agenda, jobs, disabled)
}