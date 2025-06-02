import axios from 'axios'

/**
 * 카카오맵 장소 ID로부터 첫 번째 이미지 URL을 가져옵니다.
 * @param locationId - 카카오맵 장소 ID
 * @returns 첫 번째 이미지 URL 또는 null (이미지가 없는 경우)
 */
export async function getKakaoPlaceImageUrl(locationId: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://trabuddy.kykint.com/kakao-image-proxy/${locationId}`,
      {
        timeout: 5000, // 5초 타임아웃
      },
    )

    // 응답에서 이미지 URL 추출
    const imageUrls = response.data?.image_info?.image_main_urls

    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0]
    }

    return null
  } catch (error) {
    console.error('카카오맵 이미지 URL 가져오기 실패:', error)
    return null
  }
}
