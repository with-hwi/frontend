const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 다이어그램 타입별 설정
const diagramTypes = {
  sequence: {
    dir: path.join(__dirname, '../docs/sequence_diagrams'),
    outputDir: path.join(__dirname, '../docs/sequence_diagrams/images'),
    files: [
      'user_authentication.md',
      'tour_search.md',
      'plan_management.md',
      'schedule_management.md',
    ],
  },
  usecase: {
    dir: path.join(__dirname, '../docs/use_case_diagrams'),
    outputDir: path.join(__dirname, '../docs/use_case_diagrams/images'),
    files: ['user_authentication.md', 'tour_search.md', 'plan_management.md', 'system_overview.md'],
  },
}

// 모든 출력 폴더 생성
Object.values(diagramTypes).forEach((config) => {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true })
  }
})

// Mermaid 다이어그램 추출 함수
function extractMermaidDiagrams(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const diagrams = []

  // ```mermaid로 시작하고 ```로 끝나는 블록들 찾기
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g
  let match
  let diagramIndex = 1

  while ((match = mermaidRegex.exec(content)) !== null) {
    diagrams.push({
      content: match[1],
      index: diagramIndex++,
      filename: path.basename(filePath, '.md'),
    })
  }

  return diagrams
}

// 임시 Mermaid 파일 생성 및 이미지 변환
function convertToImage(diagram, outputPath, tempDir) {
  const tempFile = path.join(tempDir, 'temp.mmd')

  try {
    // 임시 .mmd 파일 생성
    fs.writeFileSync(tempFile, diagram.content)

    // mmdc 명령어로 PNG 변환 (기본 테마, 흰 배경, 검은 글씨)
    const command = `npx mmdc -i "${tempFile}" -o "${outputPath}" -t default -b white`
    execSync(command, { stdio: 'inherit' })

    console.log(`✅ 생성완료: ${outputPath}`)
  } catch (error) {
    console.error(`❌ 변환실패 ${outputPath}:`, error.message)
  } finally {
    // 임시 파일 삭제
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }
  }
}

console.log('🎨 다이어그램 이미지 생성을 시작합니다...\n')

// 각 다이어그램 타입 처리
Object.entries(diagramTypes).forEach(([type, config]) => {
  console.log(`📊 ${type.toUpperCase()} 다이어그램 처리 시작...`)

  config.files.forEach((filename) => {
    const filePath = path.join(config.dir, filename)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일을 찾을 수 없습니다: ${filePath}`)
      return
    }

    console.log(`📄 처리중: ${filename}`)
    const diagrams = extractMermaidDiagrams(filePath)

    diagrams.forEach((diagram) => {
      const outputFilename = `${type}_${diagram.filename}_${diagram.index}.png`
      const outputPath = path.join(config.outputDir, outputFilename)
      convertToImage(diagram, outputPath, config.outputDir)
    })
  })

  console.log(`✨ ${type.toUpperCase()} 다이어그램 처리 완료!\n`)
})

console.log('🎉 모든 다이어그램 이미지 생성이 완료되었습니다!')
console.log('📁 생성된 이미지 폴더:')
Object.entries(diagramTypes).forEach(([type, config]) => {
  console.log(`  - ${type}: ${config.outputDir}`)
})
