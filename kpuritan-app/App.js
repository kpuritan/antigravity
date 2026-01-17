import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from './firebase';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPosts();
  }, []);

  const loadRecentPosts = async () => {
    try {
      const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();

      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to mock data
      setPosts([
        { id: '1', title: "청교도 신학의 정수: 존 오웬의 성령론", tags: ["청교도 신학"], createdAt: { toDate: () => new Date('2024-01-15') } },
        { id: '2', title: "현대 교회를 위한 웨스트민스터 신앙고백 해설", tags: ["신앙고백"], createdAt: { toDate: () => new Date('2024-01-12') } },
        { id: '3', title: "고난 속의 위로: 리처드 십스의 상한 갈대", tags: ["경건 서적"], createdAt: { toDate: () => new Date('2024-01-10') } },
        { id: '4', title: "설교란 무엇인가? 마틴 로이드 존스의 설교학", tags: ["설교학"], createdAt: { toDate: () => new Date('2024-01-08') } },
        { id: '5', title: "가정 예배의 회복과 실제적인 지침", tags: ["신자의 삶"], createdAt: { toDate: () => new Date('2024-01-05') } },
        { id: '6', title: "요한계시록 강해 시리즈 (1): 승리하신 그리스도", tags: ["강해설교"], createdAt: { toDate: () => new Date('2024-01-01') } }
      ]);
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>한국 청교도 연구소</Text>
        <Text style={styles.headerSubtitle}>Korean Puritan Research Institute</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>개혁주의 신학의 정수</Text>
          <Text style={styles.heroSubtitle}>
            청교도들의 경건과 신학을 현대 교회에 전합니다
          </Text>
        </View>

        {/* Featured Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최신 자료</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#c99c5e" />
              <Text style={styles.loadingText}>자료를 불러오는 중...</Text>
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.badge}>NEW</Text>
                  <Text style={styles.category}>{post.tags && post.tags[0] ? post.tags[0] : '일반'}</Text>
                </View>
                <Text style={styles.cardTitle}>{post.title}</Text>
                <Text style={styles.cardDate}>{formatDate(post.createdAt)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연구소 소개</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              본 연구소는 청교도들의 경건과 신학을 연구하고,
              현대 교회에 그들의 유산을 전달하고자 합니다.
            </Text>
            <Text style={styles.aboutAuthor}>
              한국 청교도 연구소 소장 김홍만
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자료 카테고리</Text>
          <View style={styles.categoryGrid}>
            {['청교도 신학', '신앙고백', '경건 서적', '설교학', '신자의 삶', '강해설교'].map((cat) => (
              <TouchableOpacity key={cat} style={styles.categoryButton}>
                <Text style={styles.categoryButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 한국 청교도 연구소</Text>
          <Text style={styles.footerText}>Korean Puritan Research Institute</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2d2d2d',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#c99c5e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c99c5e',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  hero: {
    padding: 30,
    backgroundColor: '#252525',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#c99c5e',
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#c99c5e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#c99c5e',
    color: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  category: {
    color: '#999',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  aboutCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 15,
  },
  aboutAuthor: {
    fontSize: 14,
    color: '#c99c5e',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c99c5e',
  },
  categoryButtonText: {
    color: '#c99c5e',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
});
