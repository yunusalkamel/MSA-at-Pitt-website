import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  return (
    <Layout>
      <section className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-2xl border-border/60 bg-card/90 shadow-lg backdrop-blur">
          <CardHeader className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Error 404</p>
            <CardTitle className="text-4xl font-bold md:text-5xl">Page Not Found</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-base text-muted-foreground md:text-lg">
              The page you&apos;re looking for may have moved, been removed, or never existed.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/join">Join MSA</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default NotFound;
