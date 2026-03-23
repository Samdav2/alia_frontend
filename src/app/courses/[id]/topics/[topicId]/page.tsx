'use client';

import React, { use } from 'react';
import { LearningRoom } from '@/components/Dashboard/StudentDashboard/LearningRoom';
import { AccessibilityFAB } from '@/components/Dashboard/Accessibility/AccessibilityFAB';

interface TopicPageProps {
  params: Promise<{
    id: string;
    topicId: string;
  }>;
}

export default function TopicPage({ params }: TopicPageProps) {
  const { id, topicId } = use(params);

  return (
    <>
      <LearningRoom courseId={id} topicId={topicId} />
      <AccessibilityFAB />
    </>
  );
}
