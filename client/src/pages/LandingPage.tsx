import { Link } from "react-router-dom";
import { Button, Card, PageHeader } from "../components/ui/UI";

const features = [
  { title: "Communities", text: "Join public or private spaces built around shared interests." },
  { title: "Posts and tags", text: "Publish Markdown posts and organize topics with global tags." },
  { title: "Social feed", text: "Follow users and keep a personalized stream of new activity." },
];

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <PageHeader eyebrow="PulseNet" title="Community feed for focused groups" />
        <p className="max-w-2xl text-sm leading-6 text-gray-600">
          Explore public communities, read posts, and sign in when you are ready to publish, comment, like, and follow other users.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/communities"><Button>Explore communities</Button></Link>
          <Link to="/login"><Button variant="secondary">Sign in</Button></Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="p-5">
            <h2 className="text-base font-semibold text-gray-900">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{feature.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
