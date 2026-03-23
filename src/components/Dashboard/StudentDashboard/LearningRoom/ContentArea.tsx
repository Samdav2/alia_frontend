'use client';

import Link from 'next/link';
import parse from 'html-react-parser';
import { ReadAloud } from '@/components/Accessibility/ReadAloud';
import BionicText from '@/components/Accessibility/BionicText';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { courseService, Topic, CourseDetails } from '@/services/api/courseService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { speechHighlightService } from '@/services/speechHighlightService';
import { useEffect, useState, useMemo } from 'react';

interface ContentAreaProps {
  courseId: string;
  topicId: string;
  summary: string[] | null;
}

interface MediaContent {
  type: 'video' | 'pdf' | 'doc' | 'image' | 'text';
  url?: string;
  title: string;
  description?: string;
  content?: string;
  altText?: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  courseId,
  topicId,
  summary,
}) => {
  const { bionicReading, isAutoPilotActive } = useUserPreferences();
  const [actualReadTime, setActualReadTime] = useState<string>('');
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(true);

  // Handle when Read Aloud completes (move to next topic in autonomous mode)
  const handleReadAloudComplete = async () => {
    if (isAutoPilotActive) {
      console.log('Read Aloud complete in autonomous mode, proceeding to next topic...');
      // Signal to autonomous agent that this topic is complete
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('topicReadingComplete', {
          detail: { courseId, topicId }
        }));
      }
    }
  };

  useEffect(() => {
    loadTopicData();
  }, [courseId, topicId]);

  const loadTopicData = async () => {
    if (!courseId || courseId === 'undefined' || !topicId || topicId === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [topicData, courseData] = await Promise.all([
        courseService.getTopicDetails(courseId, topicId),
        courseService.getCourseDetails(courseId)
      ]);
      setTopic(topicData);
      setCourse(courseData);
    } catch (err) {
      console.error('Error loading topic data:', err);
      setError('Failed to load topic content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsEnrolled(['1', '2', '3', '4'].includes(courseId));
  }, [courseId]);

  // ─── Media helpers ────────────────────────────────────────────────────────

  const getTopicMediaContent = (topicId: string): MediaContent[] => {
    const mediaMap: Record<string, MediaContent[]> = {
      '1': [
        {
          type: 'image',
          url: '/images/mas-architecture.png',
          title: 'Multi-Agent System Architecture',
          description: 'Visual representation of a typical multi-agent system architecture',
          altText: 'Diagram showing interconnected agents with communication pathways and shared environment',
          content: 'This diagram illustrates how multiple agents interact within a shared environment, each with their own sensors and actuators, communicating through message passing protocols.'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Introduction to Multi-Agent Systems',
          description: 'A comprehensive overview of multi-agent systems and their applications in education',
          content: "This video provides a visual introduction to the concepts we've discussed, showing real-world examples of multi-agent systems in action."
        }
      ],
      '2': [
        {
          type: 'image',
          url: '/images/agent-layers.png',
          title: 'Agent Architecture Layers',
          description: 'The three-layer architecture of intelligent agents',
          altText: 'Diagram showing reactive, deliberative, and social layers of agent architecture',
          content: 'The layered approach ensures agents can respond quickly to environmental changes while maintaining long-term planning capabilities.'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Agent Architecture Deep Dive',
          description: 'Understanding the core components of intelligent agents',
          content: "Watch this detailed explanation of how each layer contributes to the agent's overall intelligence and decision-making process."
        }
      ],
      '3': [
        {
          type: 'image',
          url: '/images/implementation-flow.png',
          title: 'Implementation Process Flow',
          description: 'Step-by-step implementation process visualization',
          altText: 'Flowchart showing the implementation phases from planning to deployment',
          content: 'This flowchart demonstrates the systematic approach to implementing multi-agent systems in educational environments.'
        }
      ]
    };
    return mediaMap[topicId] || [];
  };

  const getMediaTextContent = (media: MediaContent): string => {
    switch (media.type) {
      case 'pdf':
        return `PDF Document: ${media.title}. ${media.description || ''}. This document contains detailed information about the topic. Please open the PDF to view the full content.`;
      case 'doc':
        return `Word Document: ${media.title}. ${media.description || ''}. This document provides comprehensive coverage of the subject matter. Please download and open the document to access the complete content.`;
      case 'image':
        return `Image: ${media.title}. ${media.description || ''}. ${media.altText || 'Visual content that supports the learning material.'}`;
      case 'video':
        return `Video: ${media.title}. ${media.description || ''}. This video provides visual and auditory learning content to enhance your understanding of the topic.`;
      default:
        return media.content || media.description || '';
    }
  };

  // ─── Content builders ─────────────────────────────────────────────────────

  const getTopicContent = (topicId: string): string => {
    const contentMap: Record<string, string> = {
      '1': `Introduction to Multi-Agent Systems: Multi-agent systems (MAS) represent a fundamental shift towards decentralized, autonomous intelligence in educational technology. These systems consist of multiple intelligent agents that interact with each other and their environment to achieve individual and collective goals. In the context of ALIA (Adaptive Learning Intelligence Assistant), we explore how distributed agents can work together to create personalized learning experiences. The foundation of MAS lies in the principle that complex problems can be solved more effectively through the collaboration of specialized agents rather than a single monolithic system. Each agent in ALIA has specific responsibilities: content curation, accessibility adaptation, assessment generation, and learning path optimization. This introduction covers the basic concepts, terminology, and architectural patterns that form the backbone of modern educational AI systems.`,
      '2': `Core Concepts of Agent Architecture: Understanding the core concepts of agent architecture is crucial for developing effective multi-agent educational systems. An agent is defined as an autonomous entity that perceives its environment through sensors and acts upon that environment through actuators. In ALIA's context, agents perceive student behavior, learning patterns, and performance data, then act by adapting content, suggesting resources, or modifying learning paths. Key properties of agents include autonomy (independent decision-making), reactivity (responding to environmental changes), proactivity (goal-directed behavior), and social ability (interaction with other agents). The architecture typically follows a layered approach: the reactive layer handles immediate responses to environmental changes, the deliberative layer manages goal-oriented planning, and the social layer facilitates communication and coordination with other agents. This multi-layered approach ensures that ALIA can respond quickly to student needs while maintaining long-term educational objectives.`,
      '3': `Practical Implementation and Case Studies: The practical implementation of multi-agent systems in educational environments requires careful consideration of real-world constraints and user needs. This section examines several case studies where MAS has been successfully deployed in learning management systems, adaptive tutoring platforms, and collaborative learning environments. We analyze the challenges faced during implementation, including agent coordination, conflict resolution, and system scalability. The case studies demonstrate how different agent types collaborate: content agents that curate and adapt learning materials, assessment agents that generate personalized quizzes and evaluations, accessibility agents that ensure content is available to users with diverse needs, and analytics agents that track learning progress and identify areas for improvement. Each case study provides insights into the design decisions, technical challenges, and lessons learned during deployment. We also explore the metrics used to evaluate system effectiveness, including learning outcomes, user satisfaction, and system performance indicators.`,
      '4': `Advanced Topics in Multi-Agent Coordination: Advanced coordination mechanisms are essential for managing complex interactions between multiple agents in educational systems. This deep dive explores sophisticated coordination protocols, negotiation strategies, and consensus algorithms that enable agents to work together effectively. We examine distributed problem-solving techniques where agents must coordinate their actions to achieve global educational objectives while maintaining their individual specializations. Topics include contract net protocols for task allocation, auction-based resource distribution, and collaborative filtering for content recommendation. The section also covers conflict resolution mechanisms when agents have competing objectives, such as when the accessibility agent's modifications conflict with the assessment agent's requirements. We explore machine learning approaches to coordination, including reinforcement learning for multi-agent environments and evolutionary algorithms for optimizing agent behaviors. Advanced topics also include fault tolerance, where the system continues to function even when individual agents fail, and dynamic agent creation and destruction based on changing educational needs.`,
      '5': `Case Studies and Real-World Applications: This comprehensive examination of real-world applications showcases how multi-agent systems have been successfully implemented in various educational contexts. We analyze large-scale deployments in universities, K-12 schools, and corporate training environments. Each case study provides detailed insights into the system architecture, agent roles and responsibilities, implementation challenges, and measurable outcomes. The studies cover diverse educational domains including STEM education, language learning, professional development, and special needs education. We examine how different institutions have adapted MAS principles to their specific requirements, cultural contexts, and technological constraints. The analysis includes quantitative results such as improved learning outcomes, reduced dropout rates, and increased student engagement, as well as qualitative feedback from educators and learners. We also explore the economic aspects of MAS implementation, including cost-benefit analyses, return on investment calculations, and long-term sustainability considerations. The case studies provide practical guidance for educators and technologists considering MAS adoption in their own contexts.`
    };
    return contentMap[topicId] || `Multi-agent systems (MAS) represent a shift towards decentralized, autonomous intelligence. In this chapter, we explore how ALIA's core agents—Content, Access, and Assessment—synchronize to create a personalized learning trajectory for every student. We focus specifically on the heuristic feedback loops that allow the system to adapt in real-time.`;
  };

  const getEnhancedTopicContent = (
    topicId: string,
    apiContent?: string
  ): { text: string; media: MediaContent | null; isHtml?: boolean }[] => {
    const baseContent = apiContent || getTopicContent(topicId);
    const mediaContent = getTopicMediaContent(topicId);
    const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str);

    if (isHtml(baseContent)) {
      return [{ text: baseContent, media: null, isHtml: true }];
    }

    const paragraphs = baseContent
      .split('. ')
      .map(sentence => sentence + (sentence.endsWith('.') ? '' : '.'));

    const enhancedContent: { text: string; media: MediaContent | null }[] = [];

    if (paragraphs.length > 0) enhancedContent.push({ text: paragraphs[0], media: null });
    if (mediaContent.length > 0 && paragraphs.length > 1)
      enhancedContent.push({ text: '', media: mediaContent[0] });

    const middleStart = 1;
    const middleEnd = Math.floor(paragraphs.length * 0.6);
    for (let i = middleStart; i < middleEnd && i < paragraphs.length; i++)
      enhancedContent.push({ text: paragraphs[i], media: null });

    if (mediaContent.length > 1 && paragraphs.length > middleEnd)
      enhancedContent.push({ text: '', media: mediaContent[1] });

    for (let i = middleEnd; i < paragraphs.length; i++)
      enhancedContent.push({ text: paragraphs[i], media: null });

    for (let i = 2; i < mediaContent.length; i++)
      enhancedContent.push({ text: '', media: mediaContent[i] });

    return enhancedContent;
  };

  // ─── Raw HTML content from API ────────────────────────────────────────────
  const rawContent = topic?.content || '';
  const enhancedContent = getEnhancedTopicContent(topicId, topic?.content);

  /**
   * speakableContent — a clean, HTML-free string built from ALL content
   * sections (text paragraphs + media descriptions) so ReadAloud always
   * receives plain text regardless of what the API returns.
   *
   * This is the single source of truth for TTS; rawContent is only used
   * for reading-time calculation and visual rendering.
   */
  const speakableContent = useMemo((): string => {
    const stripHtml = (html: string): string => {
      if (!html) return '';
      // Browser path — perfect entity decoding via DOM
      if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = html;
        // Space after block elements so sentences don't merge
        div.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, div, br').forEach((el) => {
          el.appendChild(document.createTextNode(' '));
        });
        return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
      }
      // SSR fallback
      return html
        .replace(/<\/(p|li|h[1-6]|div|br)>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    };

    const parts = enhancedContent
      .map((item) => {
        const chunks: string[] = [];
        if (item.text) chunks.push(stripHtml(item.text));
        if (item.media) chunks.push(getMediaTextContent(item.media));
        return chunks.filter(Boolean).join(' ');
      })
      .filter(Boolean);

    // Also include summary points so the full lesson is readable end-to-end
    if (summary && summary.length > 0) {
      parts.unshift('AI Synthesis Summary. ' + summary.join('. '));
    }

    return parts.join(' ');
  }, [enhancedContent, summary]);

  // ─── Side effects ─────────────────────────────────────────────────────────

  const handleMediaSelect = (media: MediaContent) => {
    if (isAutoPilotActive) {
      textToSpeechService.announce(getMediaTextContent(media));
    }
  };

  useEffect(() => {
    const readingTimeSeconds = textToSpeechService.calculateReadingTime(rawContent);
    const minutes = Math.floor(readingTimeSeconds / 60);
    const seconds = readingTimeSeconds % 60;
    setActualReadTime(minutes > 0 ? `${minutes}m ${seconds}s read` : `${seconds}s read`);

    const checkHighlighting = () => setIsHighlighting(speechHighlightService.isActive());
    const interval = setInterval(checkHighlighting, 500);
    return () => clearInterval(interval);
  }, [rawContent]);

  // ─── Render guards ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading topic content...</p>
        </div>
      </div>
    );
  }

  if (error || !topic || !course) {
    return (
      <div className="max-w-6xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            {error || 'Topic Not Found'}
          </h1>
          <p className="text-slate-600 mb-6">
            {error ? 'There was an error loading the topic content.' : 'The requested topic could not be found.'}
          </p>
          <Link href={`/courses/${courseId}`} className="text-blue-600 font-bold hover:underline">
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-12 space-y-8 sm:space-y-12 pb-32 lg:pb-16">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/student"
            className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 border-b border-slate-100 pb-6 sm:pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {topic.title} <span className="alia-gradient-text">Learning</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-500 font-bold tracking-wide text-sm sm:text-base">
              <span>{`${course.code} - ${course.title}`}</span>
              <span>•</span>
              <span className="text-blue-600">{actualReadTime || 'Calculating...'}</span>
              <span>•</span>
              <span>Est. {Math.floor(topic.duration / 60)}min study time</span>
            </div>
          </div>

          {/* ✅ Pass speakableContent — always plain text, never raw HTML */}
          <div className="glass-card p-2 rounded-2xl border-blue-50">
            <ReadAloud
              text={speakableContent}
              autoPlay={isAutoPilotActive}
              onComplete={handleReadAloudComplete}
            />
          </div>
        </div>
      </div>

      {/* AI Intelligence Card */}
      {summary && (
        <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 border-blue-100 shadow-2xl shadow-blue-500/10 relative overflow-hidden animate-bounce-in">
          <div className="absolute top-0 right-0 p-6 sm:p-8 text-3xl sm:text-4xl opacity-10">✨</div>
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg">
                A
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AI Synthesis Summary
              </h3>
            </div>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {summary.map((point, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl border border-white/60"
                >
                  <span className="font-black text-blue-600 text-sm sm:text-base">{idx + 1}.</span>
                  <span className="text-slate-700 font-bold leading-relaxed text-sm sm:text-base">
                    {bionicReading ? <BionicText text={point} /> : point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content Body with Inline Media */}
      <div className="prose prose-lg sm:prose-xl max-w-none">
        {isHighlighting && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl flex items-center gap-3 animate-fade-in">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse text-sm sm:text-base">
              👁️
            </div>
            <div>
              <p className="font-black text-yellow-800 text-xs sm:text-sm">Reading Mode Active</p>
              <p className="text-[10px] sm:text-xs text-yellow-600">Follow along as words are highlighted</p>
            </div>
          </div>
        )}

        <div
          className="text-slate-700 leading-relaxed font-medium space-y-6 sm:space-y-8 text-base sm:text-lg lg:text-xl"
          id="content-area"
        >
          {enhancedContent.map((item, idx) => (
            <div key={idx}>
              {item.text && (
                <div className="leading-relaxed mb-6">
                  {item.isHtml ? (
                    <div className="rich-text-content">{parse(item.text)}</div>
                  ) : (
                    <p>{bionicReading ? <BionicText text={item.text} /> : item.text}</p>
                  )}
                </div>
              )}

              {item.media && (
                <div className="my-8 sm:my-12">
                  {item.media.type === 'image' && (
                    <figure className="space-y-4">
                      <div className="relative group">
                        <img
                          src={item.media.url}
                          alt={item.media.altText || item.media.title}
                          className="w-full h-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                        />
                        <button
                          onClick={() => textToSpeechService.announce(getMediaTextContent(item.media!))}
                          className="absolute top-4 right-4 p-2 bg-white/90 text-slate-700 rounded-xl font-bold text-sm hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Read image description aloud"
                        >
                          🔊
                        </button>
                      </div>
                      <figcaption className="text-center space-y-2">
                        <h4 className="font-black text-slate-900 text-base sm:text-lg">{item.media.title}</h4>
                        <p className="text-sm sm:text-base text-slate-600 font-medium italic">{item.media.description}</p>
                        {item.media.content && (
                          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                            {bionicReading ? <BionicText text={item.media.content} /> : item.media.content}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  )}

                  {item.media.type === 'video' && (
                    <figure className="space-y-4">
                      <div className="relative group">
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <iframe
                            src={item.media.url}
                            className="w-full h-full"
                            allowFullScreen
                            title={item.media.title}
                          />
                        </div>
                        <button
                          onClick={() => textToSpeechService.announce(getMediaTextContent(item.media!))}
                          className="absolute top-4 right-4 p-2 bg-white/90 text-slate-700 rounded-xl font-bold text-sm hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Read video description aloud"
                        >
                          🔊
                        </button>
                      </div>
                      <figcaption className="text-center space-y-2">
                        <h4 className="font-black text-slate-900 text-base sm:text-lg">{item.media.title}</h4>
                        <p className="text-sm sm:text-base text-slate-600 font-medium italic">{item.media.description}</p>
                        {item.media.content && (
                          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                            {bionicReading ? <BionicText text={item.media.content} /> : item.media.content}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
