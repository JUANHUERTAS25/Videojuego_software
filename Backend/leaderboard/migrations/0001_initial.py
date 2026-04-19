# Generated manually for initial leaderboard schema.
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nickname', models.CharField(max_length=32, unique=True)),
                ('score', models.IntegerField(default=0)),
                ('player_id', models.CharField(db_index=True, max_length=64)),
                ('date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-score', 'date'],
            },
        ),
    ]
