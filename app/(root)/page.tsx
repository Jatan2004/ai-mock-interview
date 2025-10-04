import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { interviewCovers } from "@/constants";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-7 max-w-lg">
          <h2 className="text-4xl md:text-5xl leading-tight">Crack your next interview with AI mock sessions</h2>
          <p className="text-lg">
            Practice real questions in a timed, voice-first session and get instant, rubric-based feedback.
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview" aria-label="Start an AI mock interview">Create mock interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-4 mt-8">
        <h2>How it works</h2>
        <p className="text-sm text-muted-foreground">Three simple steps to get interview-ready.</p>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div className="card p-6 min-h-40 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/globe.svg" alt="choose role" width={24} height={24} />
              <h3 className="text-primary dark:text-primary-100">Choose your role</h3>
            </div>
            <p>Select a role or generate a custom interview tailored to your goals.</p>
          </div>
          <div className="card p-6 min-h-40 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/react.svg" alt="practice" width={24} height={24} />
              <h3 className="text-primary dark:text-primary-100">Practice in real-time</h3>
            </div>
            <p>Speak your answers. The AI interviewer adapts and asks follow-ups.</p>
          </div>
          <div className="card p-6 min-h-40 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/star.svg" alt="get feedback" width={24} height={24} />
              <h3 className="text-primary dark:text-primary-100">Get instant feedback</h3>
            </div>
            <p>Review scores and targeted tips to improve on your next attempt.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                canDelete
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                canDelete={false}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
