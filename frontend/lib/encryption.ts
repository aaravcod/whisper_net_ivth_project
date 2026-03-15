// Simple encryption/decryption utilities for WhisperNet
// Note: In production, use established cryptographic libraries

export interface EncryptionKey {
  id: string
  key: string
  algorithm: string
  createdAt: Date
}

export class EncryptionManager {
  private key: string

  constructor(key?: string) {
    this.key = key || this.generateKey()
  }

  generateKey(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  encrypt(data: string): string {
    // Simple XOR encryption for demonstration
    // In production, use SubtleCrypto API or libsodium.js
    let result = ''
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length))
    }
    return btoa(result) // Base64 encode
  }

  decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData) // Base64 decode
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length))
      }
      return result
    } catch (e) {
      console.error('Decryption failed:', e)
      return ''
    }
  }

  getKeyHash(): string {
    return btoa(this.key).substring(0, 16)
  }
}

export function hashData(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}
