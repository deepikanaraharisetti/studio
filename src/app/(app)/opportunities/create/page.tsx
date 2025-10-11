import CreateOpportunityForm from "@/components/create-opportunity-form";

export default function CreateOpportunityPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create a New Opportunity</h1>
                <p className="text-muted-foreground">Define your project and find the perfect team to bring it to life.</p>
            </div>
            <CreateOpportunityForm />
        </div>
    );
}
