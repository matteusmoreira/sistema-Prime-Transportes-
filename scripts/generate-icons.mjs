import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function main() {
  const root = process.cwd()
  const inputSvg = path.join(root, 'public', 'icons', 'car.svg')
  const outDir = path.join(root, 'public', 'icons')

  if (!fs.existsSync(inputSvg)) {
    console.error(`[PWA Icons] Arquivo SVG não encontrado: ${inputSvg}`)
    process.exit(1)
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const targets = [
    { size: 180, name: 'icon-180.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 256, name: 'icon-256.png' },
    { size: 384, name: 'icon-384.png' },
    { size: 512, name: 'icon-512.png' },
  ]

  for (const t of targets) {
    const outPath = path.join(outDir, t.name)
    try {
      await sharp(inputSvg, { density: t.size * 4 })
        .resize(t.size, t.size)
        .png({ compressionLevel: 9 })
        .toFile(outPath)
      console.log(`[PWA Icons] Gerado ${t.name}`)
    } catch (err) {
      console.error(`[PWA Icons] Falha ao gerar ${t.name}:`, err)
      process.exitCode = 1
    }
  }
}

main().catch((e) => {
  console.error('[PWA Icons] Erro inesperado:', e)
  process.exit(1)
})