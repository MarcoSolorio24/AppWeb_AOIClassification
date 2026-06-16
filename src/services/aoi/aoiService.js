import client from '../../api/client'

const basePath = '/api/aoi'

export const AOIService = {
  health: async () => {
    const response = await client.get(`${basePath}/health`)
    return response.data
  },

  getClasses: async () => {
    const response = await client.get(`${basePath}/classes`)
    return response.data
  },

  getBatchStatus: async () => {
    const response = await client.get(`${basePath}/batch/status`)
    return response.data
  },

  getCurrentBatch: async () => {
    const response = await client.get(`${basePath}/batch/current`)
    return response.data
  },

  getCurrentImage: async () => {
    const response = await client.get(`${basePath}/batch/current/image`)
    return response.data
  },

  getNextImage: async () => {
    const response = await client.post(`${basePath}/batch/current/next-image`)
    return response.data
  },

  predictCurrentImage: async () => {
    const response = await client.post(`${basePath}/batch/current/analyze`)
    return response.data
  },

  finishCurrentBatch: async () => {
    const response = await client.post(`${basePath}/batch/current/finish`)
    return response.data
  },
}