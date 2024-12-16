import { STSClient, AssumeRoleCommand, Credentials, AssumeRoleCommandInput } from '@aws-sdk/client-sts'
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'

export interface RoleCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration?: Date
}

export interface AssumeRoleConfig {
  roleArn: string
  roleSessionName: string
  durationSeconds?: number
  region?: string
  externalId?: string
}

export class AWSRoleManager {
  private stsClient: STSClient

  constructor(region: string = 'us-east-1') {
    this.stsClient = new STSClient({ region })
  }

  async assumeRole(config: AssumeRoleConfig): Promise<RoleCredentials> {
    try {
      const params: AssumeRoleCommandInput = {
        RoleArn: config.roleArn,
        RoleSessionName: config.roleSessionName,
        DurationSeconds: config.durationSeconds || 3600, // Default 1 hour
      }

      // Add ExternalId if provided
      if (config.externalId) {
        params.ExternalId = config.externalId
      }

      const command = new AssumeRoleCommand(params)
      const response = await this.stsClient.send(command)

      if (!response.Credentials) {
        throw new Error('Failed to obtain credentials')
      }

      return {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
        expiration: response.Credentials.Expiration,
      }
    } catch (error) {
      console.error('Error assuming role:', error)
      throw error
    }
  }

  async getCredentialsProvider(config: AssumeRoleConfig) {
    return fromTemporaryCredentials({
      params: {
        RoleArn: config.roleArn,
        RoleSessionName: config.roleSessionName,
        DurationSeconds: config.durationSeconds || 3600,
        ExternalId: config.externalId,
      },
      clientConfig: { region: config.region || 'us-east-1' },
    })
  }
}
