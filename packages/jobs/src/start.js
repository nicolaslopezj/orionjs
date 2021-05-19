import Daemon from './daemon'
import JobsCollection from './JobsCollection'
import initJobs from './initJobs'
import {config} from '@orion-js/app'
import DaemonStats from './daemon/DaemonStats'

export default async function (jobs, workersCountParam = 4) {
  // dont run jobs in test env
  if (process.env.ORION_TEST) return
  const {logger, jobs: jobsConfig} = config()
  const workersCount = (jobsConfig && jobsConfig.workers) || workersCountParam
  await JobsCollection.await()

  await initJobs(jobs)

  global.jobs = jobs

  logger.info(`Starting jobs with ${workersCount} workers`)

  // starts the daemon
  Daemon.init({
    workersCount,
    jobs,
    statsOn: jobsConfig && jobsConfig.disabled
  })
}
